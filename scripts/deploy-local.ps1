param(
  [switch]$SkipInstall,
  [switch]$SkipTests,
  [switch]$NoStart,
  [int]$Port = 0,
  [string]$HostAddress = ''
)

$ErrorActionPreference = 'Stop'
$projectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
Set-Location $projectRoot

function Invoke-NpmCommand {
  param([string[]]$NpmArgs, [string]$Label)
  Write-Host "`n==> $Label"
  & npm @NpmArgs
  if ($LASTEXITCODE -ne 0) { throw "$Label failed with exit code $LASTEXITCODE." }
}

$nodeVersionText = (& node --version).TrimStart('v')
if ($LASTEXITCODE -ne 0) { throw 'Node.js was not found. Install Node.js 22.5 or newer.' }
$nodeVersion = [version]$nodeVersionText
if ($nodeVersion -lt [version]'22.5.0') { throw "Node.js $nodeVersionText is too old; version 22.5.0 or newer is required." }

Write-Host "Project: $projectRoot"
Write-Host "Node.js: $nodeVersionText"

& (Join-Path $PSScriptRoot 'stop-local.ps1')

if (-not (Test-Path -LiteralPath (Join-Path $projectRoot '.env'))) {
  Copy-Item -LiteralPath (Join-Path $projectRoot '.env.example') -Destination (Join-Path $projectRoot '.env')
  Write-Host 'Created .env from .env.example.'
}

if (-not $SkipInstall) {
  Invoke-NpmCommand @('ci') 'Install locked dependencies'
}

if (Test-Path -LiteralPath (Join-Path $projectRoot 'data\cfdsolve.sqlite')) {
  Invoke-NpmCommand @('run', 'db:backup') 'Back up the current database'
}

Invoke-NpmCommand @('run', 'db:init') 'Initialize or migrate the database'
Invoke-NpmCommand @('run', 'db:check') 'Check database integrity'

if (-not $SkipTests) {
  Invoke-NpmCommand @('run', 'audit:prod') 'Audit production dependencies'
  Invoke-NpmCommand @('run', 'typecheck') 'Run type checking'
  Invoke-NpmCommand @('run', 'test:formula') 'Test formula conversion'
  Invoke-NpmCommand @('run', 'test:knowledge') 'Test knowledge import'
}

Invoke-NpmCommand @('run', 'build') 'Build the production bundle'

if ($NoStart) {
  Write-Host "`nLocal deployment build completed without starting the service."
} else {
  $startArgs = @{}
  if ($Port -gt 0) { $startArgs.Port = $Port }
  if ($HostAddress) { $startArgs.HostAddress = $HostAddress }
  & (Join-Path $PSScriptRoot 'start-local.ps1') @startArgs
  if ($LASTEXITCODE -ne 0) { throw 'The production service failed to start.' }
  Write-Host "`nFull local deployment completed."
}
