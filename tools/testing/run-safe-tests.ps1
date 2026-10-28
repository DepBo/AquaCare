$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$reportDir = Join-Path $root 'test-results'
New-Item -ItemType Directory -Path $reportDir -Force | Out-Null
$dockerDir = Join-Path $env:LOCALAPPDATA 'Programs\DockerDesktop\resources\bin'
$env:PATH = "$dockerDir;$env:PATH"
$results = [System.Collections.Generic.List[object]]::new()
$backendProcess = $null

function Run-Suite([string]$name, [scriptblock]$body) {
  Write-Host "`n=== $name ===" -ForegroundColor Cyan
  $started = Get-Date
  try {
    & $body
    if ($LASTEXITCODE -ne 0) { throw "Exit code $LASTEXITCODE" }
    $results.Add([pscustomobject]@{ Suite = $name; Result = 'PASS'; Seconds = [math]::Round(((Get-Date) - $started).TotalSeconds, 1) })
  } catch {
    Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
    $results.Add([pscustomobject]@{ Suite = $name; Result = 'FAIL'; Seconds = [math]::Round(((Get-Date) - $started).TotalSeconds, 1) })
  }
}

try {
  # Read only local CLI status. Never load AquaCare's production .env files.
  Push-Location $root
  $priorErrorAction = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  try {
    $statusLines = & npx.cmd --yes supabase status -o env 2>&1
    $statusExitCode = $LASTEXITCODE
  } finally {
    $ErrorActionPreference = $priorErrorAction
    Pop-Location
  }
  if ($statusExitCode -ne 0) { throw 'Local Supabase is not running. Start it from the AquaCare folder first.' }
  $local = @{}
  foreach ($line in $statusLines) {
    if ($line -match '^([A-Z_]+)="?([^"\r\n]+)"?$') { $local[$matches[1]] = $matches[2].TrimEnd('"') }
  }
  if ($local.API_URL -ne 'http://127.0.0.1:54321' -or
      -not $local.PUBLISHABLE_KEY.StartsWith('sb_publishable_') -or
      -not $local.SECRET_KEY.StartsWith('sb_secret_')) {
    throw 'Local Supabase status is invalid; refusing to run tests.'
  }
  $dbContainer = & docker.exe inspect supabase_db_AquaCare --format '{{.State.Running}}' 2>$null
  if ($LASTEXITCODE -ne 0 -or $dbContainer.Trim() -ne 'true') {
    throw 'The AquaCare local database container is not running.'
  }

  $env:AQUACARE_TEST_MODE = '1'
  $env:SUPABASE_URL = 'http://127.0.0.1:54321'
  $env:SUPABASE_SERVICE_ROLE_KEY = $local.SECRET_KEY
  $env:VITE_SUPABASE_URL = 'http://127.0.0.1:54321'
  $env:VITE_SUPABASE_ANON_KEY = $local.PUBLISHABLE_KEY
  $env:VITE_API_URL = 'http://127.0.0.1:5051'
  $env:PORT = '5051'
  foreach ($name in @('EMAIL_USER', 'EMAIL_PASS', 'BREVO_API_KEY', 'FIREBASE_SERVICE_ACCOUNT', 'ALERT_EMAIL_FROM', 'RENDER')) {
    Set-Item "Env:$name" '__AQUACARE_TEST_DISABLED__'
  }

  Run-Suite 'Backend unit and safety tests' {
    Push-Location (Join-Path $root 'AquaCare_Backend')
    try { & npm.cmd run test:all } finally { Pop-Location }
  }
  Run-Suite 'Flutter mobile widget tests' {
    Push-Location (Join-Path $root 'AquaCare_App')
    try { & flutter.bat test } finally { Pop-Location }
  }

  if (Get-NetTCPConnection -LocalPort 5051 -State Listen -ErrorAction SilentlyContinue) {
    throw 'Port 5051 is already in use. Refusing to reuse an unknown backend.'
  }
  $backendDir = Join-Path $root 'AquaCare_Backend'
  $backendProcess = Start-Process -FilePath (Get-Command node.exe).Source -ArgumentList 'server.js' `
    -WorkingDirectory $backendDir -WindowStyle Hidden -PassThru `
    -RedirectStandardOutput (Join-Path $reportDir 'backend.log') `
    -RedirectStandardError (Join-Path $reportDir 'backend-error.log')
  $ready = $false
  for ($attempt = 0; $attempt -lt 30; $attempt++) {
    if ($backendProcess.HasExited) { throw 'Isolated backend exited during startup. See test-results/backend-error.log.' }
    try {
      $health = Invoke-WebRequest -Uri 'http://127.0.0.1:5051/api/health' -UseBasicParsing -TimeoutSec 2
      if ($health.StatusCode -eq 200) { $ready = $true; break }
    } catch { Start-Sleep -Milliseconds 500 }
  }
  if (-not $ready) { throw 'Isolated backend did not become healthy.' }

  Run-Suite 'Playwright web desktop and phone smoke tests' {
    Push-Location (Join-Path $root 'AquaCare_Web')
    try { & npm.cmd run test:e2e } finally { Pop-Location }
  }
} catch {
  Write-Host "SAFETY STOP: $($_.Exception.Message)" -ForegroundColor Red
  $results.Add([pscustomobject]@{ Suite = 'Environment preflight'; Result = 'STOPPED'; Seconds = 0 })
} finally {
  if ($backendProcess -and -not $backendProcess.HasExited) { Stop-Process -Id $backendProcess.Id -Force }
  $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
  $lines = @('# AquaCare isolated test run', '', "Run: $timestamp (local time)", '', '| Suite | Result | Seconds |', '|---|---|---:|')
  foreach ($row in $results) { $lines += "| $($row.Suite) | $($row.Result) | $($row.Seconds) |" }
  $lines += @('', 'These suites cover existing automated checks and three new web smoke checks. They do not mark all 178 system test cases as passed.', 'No production database, MQTT broker, email provider, Firebase project, or physical relay is used by this runner.')
  Set-Content -LiteralPath (Join-Path $reportDir 'latest.md') -Value $lines -Encoding UTF8
  Write-Host "`nReport: $reportDir\latest.md"
  if ($results.Where({ $_.Result -ne 'PASS' }).Count -gt 0) { exit 1 }
}
