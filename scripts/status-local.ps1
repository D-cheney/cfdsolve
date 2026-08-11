$ErrorActionPreference = 'Stop'
$projectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$stateFile = Join-Path $projectRoot '.run\server.json'

if (-not (Test-Path -LiteralPath $stateFile)) {
  Write-Host 'Status: stopped'
  exit 1
}

$state = Get-Content -Raw -LiteralPath $stateFile -Encoding UTF8 | ConvertFrom-Json
try {
  $process = Get-Process -Id ([int]$state.pid) -ErrorAction Stop
  $health = Invoke-RestMethod -Uri "$($state.url)api/health/database" -TimeoutSec 5
  if ($health.ok -ne $true) { throw 'Database health check failed.' }
  Write-Host 'Status: healthy'
  Write-Host "URL: $($state.url)"
  Write-Host "PID: $($process.Id)"
  Write-Host "Database: SQLite / Schema $($health.schemaVersion)"
} catch {
  Write-Host "Status: unhealthy ($($_.Exception.Message))"
  exit 1
}
