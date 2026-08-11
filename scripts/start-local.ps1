param(
  [int]$Port = 0,
  [string]$HostAddress = ''
)

$ErrorActionPreference = 'Stop'
$projectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$runDirectory = Join-Path $projectRoot '.run'
$logDirectory = Join-Path $projectRoot 'logs'
$stateFile = Join-Path $runDirectory 'server.json'

Set-Location $projectRoot

function Import-DotEnv {
  param([string]$Path)
  if (-not (Test-Path -LiteralPath $Path)) { return }

  foreach ($line in Get-Content -LiteralPath $Path -Encoding UTF8) {
    $trimmed = $line.Trim()
    if (-not $trimmed -or $trimmed.StartsWith('#')) { continue }
    $separator = $trimmed.IndexOf('=')
    if ($separator -lt 1) { continue }

    $name = $trimmed.Substring(0, $separator).Trim()
    $value = $trimmed.Substring($separator + 1).Trim()
    if (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'"))) {
      $value = $value.Substring(1, $value.Length - 2)
    }
    [Environment]::SetEnvironmentVariable($name, $value, 'Process')
  }
}

Import-DotEnv (Join-Path $projectRoot '.env')

if ($Port -gt 0) { $env:NITRO_PORT = [string]$Port }
if ($HostAddress) { $env:NITRO_HOST = $HostAddress }
if (-not $env:NITRO_PORT) { $env:NITRO_PORT = '3000' }
if (-not $env:NITRO_HOST) { $env:NITRO_HOST = '127.0.0.1' }
if (-not $env:CFDSOLVE_DB_PATH) { $env:CFDSOLVE_DB_PATH = './data/cfdsolve.sqlite' }

if (-not (Test-Path -LiteralPath (Join-Path $projectRoot '.output\server\index.mjs'))) {
  throw 'Production build not found. Run npm run build or npm run deploy:local first.'
}

New-Item -ItemType Directory -Force -Path $runDirectory, $logDirectory | Out-Null

if (Test-Path -LiteralPath $stateFile) {
  try {
    $existingState = Get-Content -Raw -LiteralPath $stateFile -Encoding UTF8 | ConvertFrom-Json
    $existingProcess = Get-Process -Id ([int]$existingState.pid) -ErrorAction Stop
    Write-Host "The site is already running: $($existingState.url) (PID $($existingProcess.Id))"
    exit 0
  } catch {
    Remove-Item -LiteralPath $stateFile -Force -ErrorAction SilentlyContinue
  }
}

$listenPort = [int]$env:NITRO_PORT
$occupied = Get-NetTCPConnection -State Listen -LocalPort $listenPort -ErrorAction SilentlyContinue | Select-Object -First 1
if ($occupied) {
  throw "Port $listenPort is already used by PID $($occupied.OwningProcess). Stop it or select another port."
}

$nodePath = (Get-Command node -ErrorAction Stop).Source
$stdoutLog = Join-Path $logDirectory 'server.out.log'
$stderrLog = Join-Path $logDirectory 'server.err.log'
$process = Start-Process -FilePath $nodePath `
  -ArgumentList @('.output/server/index.mjs') `
  -WorkingDirectory $projectRoot `
  -WindowStyle Hidden `
  -RedirectStandardOutput $stdoutLog `
  -RedirectStandardError $stderrLog `
  -PassThru

$accessHost = if ($env:NITRO_HOST -in @('0.0.0.0', '::')) { '127.0.0.1' } else { $env:NITRO_HOST }
$url = "http://${accessHost}:$listenPort/"
$state = [ordered]@{
  pid = $process.Id
  url = $url
  host = $env:NITRO_HOST
  port = $listenPort
  projectRoot = $projectRoot
  startedAt = (Get-Date).ToString('o')
}
$state | ConvertTo-Json | Set-Content -LiteralPath $stateFile -Encoding UTF8

$healthy = $false
for ($attempt = 1; $attempt -le 30; $attempt++) {
  Start-Sleep -Seconds 1
  if ($process.HasExited) { break }
  try {
    $health = Invoke-RestMethod -Uri "${url}api/health/database" -TimeoutSec 3
    if ($health.ok -eq $true) {
      $healthy = $true
      break
    }
  } catch {
    # The service is still starting.
  }
}

if (-not $healthy) {
  if (-not $process.HasExited) { Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue }
  Remove-Item -LiteralPath $stateFile -Force -ErrorAction SilentlyContinue
  $details = if (Test-Path -LiteralPath $stderrLog) { (Get-Content -Tail 20 -LiteralPath $stderrLog) -join [Environment]::NewLine } else { 'No error log was written.' }
  throw "The service did not pass its database health check.`n$details"
}

Write-Host "Site started: $url"
Write-Host 'Database health check: passed'
Write-Host "Logs: $logDirectory"
