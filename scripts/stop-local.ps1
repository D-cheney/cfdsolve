$ErrorActionPreference = 'Stop'
$projectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$stateFile = Join-Path $projectRoot '.run\server.json'

if (-not (Test-Path -LiteralPath $stateFile)) {
  Write-Host 'No managed site process is running.'
  exit 0
}

$state = Get-Content -Raw -LiteralPath $stateFile -Encoding UTF8 | ConvertFrom-Json
try {
  $process = Get-CimInstance Win32_Process -Filter "ProcessId=$([int]$state.pid)" -ErrorAction Stop
  if ($process -and $process.Name -match '^node(\.exe)?$' -and $process.CommandLine -match '\.output[/\\]server[/\\]index\.mjs') {
    Stop-Process -Id ([int]$state.pid) -Force
    Write-Host "Site process stopped (PID $($state.pid))."
  } else {
    Write-Warning 'The recorded PID belongs to another process and was not stopped.'
  }
} catch {
  Write-Host 'The recorded site process had already stopped.'
} finally {
  Remove-Item -LiteralPath $stateFile -Force -ErrorAction SilentlyContinue
}
