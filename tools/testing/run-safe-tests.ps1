$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$reportDir = Join-Path $root 'test-results'
New-Item -ItemType Directory -Path $reportDir -Force | Out-Null
$dockerDir = Join-Path $env:LOCALAPPDATA 'Programs\DockerDesktop\resources\bin'
$env:PATH = "$dockerDir;$env:PATH"
$results = [System.Collections.Generic.List[object]]::new()
$backendProcess = $null
$startedLocalSupabase = $false

function Get-LocalSupabaseStatus {
  Push-Location $root
  $priorErrorAction = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  try {
    $lines = & npx.cmd --yes supabase status -o env 2>&1
    $code = $LASTEXITCODE
  } finally {
    $ErrorActionPreference = $priorErrorAction
    Pop-Location
  }
  return @{ Lines = $lines; ExitCode = $code }
}

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
  $localStatus = Get-LocalSupabaseStatus
  if ($localStatus.ExitCode -ne 0) {
    & docker.exe info --format '{{.ServerVersion}}' *> $null
    if ($LASTEXITCODE -ne 0) { throw 'Docker Desktop is not running. Open Docker Desktop, then click Run again.' }
    & docker.exe network inspect aquacare-local-only *> $null
    if ($LASTEXITCODE -ne 0) {
      & docker.exe network create -o 'com.docker.network.bridge.host_binding_ipv4=127.0.0.1' aquacare-local-only | Out-Null
      if ($LASTEXITCODE -ne 0) { throw 'Could not create the local Docker network.' }
    }
    Write-Host 'Starting local Supabase. Production is not contacted.' -ForegroundColor Cyan
    Push-Location $root
    $priorErrorAction = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    try {
      & npx.cmd --yes supabase start --network-id aquacare-local-only 2>&1 | ForEach-Object {
        $message = [string]$_
        if ($message -match 'Started supabase|Starting database|Starting containers|Waiting for health') { Write-Host $message }
      }
      $startExitCode = $LASTEXITCODE
    } finally {
      $ErrorActionPreference = $priorErrorAction
      Pop-Location
    }
    if ($startExitCode -ne 0) { throw 'Could not start local Supabase; no tests were run.' }
    $startedLocalSupabase = $true
    $localStatus = Get-LocalSupabaseStatus
  }
  if ($localStatus.ExitCode -ne 0) { throw 'Local Supabase is unavailable; no tests were run.' }
  $local = @{}
  foreach ($line in $localStatus.Lines) {
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
  $tableCount = & docker.exe exec supabase_db_AquaCare psql -U postgres -d postgres -Atc "select count(*) from pg_tables where schemaname='public'" 2>$null
  if ($LASTEXITCODE -ne 0 -or $tableCount.Trim() -ne '19') {
    throw 'The local database does not contain the expected 19 AquaCare tables.'
  }
  $fixturePath = Join-Path $root 'tools\testing\seed-local.sql'
  & docker.exe cp $fixturePath 'supabase_db_AquaCare:/tmp/aquacare-seed-local.sql' *> $null
  if ($LASTEXITCODE -ne 0) { throw 'Could not copy synthetic fixture into the local database container.' }
  & docker.exe exec supabase_db_AquaCare psql -X -v ON_ERROR_STOP=1 -U postgres -d postgres -f /tmp/aquacare-seed-local.sql *> $null
  if ($LASTEXITCODE -ne 0) { throw 'Could not seed the local database; no tests were run.' }

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
  Push-Location (Join-Path $root 'AquaCare_Backend')
  try { & node.exe testing/seed-local-auth.js (Join-Path $reportDir 'local-fixtures.json') } finally { Pop-Location }
  if ($LASTEXITCODE -ne 0) { throw 'Could not create local Auth fixtures; no tests were run.' }

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
    try {
      $playwrightJson = Join-Path $reportDir 'playwright.json'
      if (Test-Path $playwrightJson) { Remove-Item -LiteralPath $playwrightJson }
      & npm.cmd run test:e2e
    } finally { Pop-Location }
  }
} catch {
  Write-Host "SAFETY STOP: $($_.Exception.Message)" -ForegroundColor Red
  $results.Add([pscustomobject]@{ Suite = 'Environment preflight'; Result = 'STOPPED'; Seconds = 0 })
} finally {
  if ($backendProcess -and -not $backendProcess.HasExited) { Stop-Process -Id $backendProcess.Id -Force }
  if ($startedLocalSupabase) {
    Write-Host 'Stopping local Supabase and saving its backup...' -ForegroundColor Cyan
    Push-Location $root
    try {
      & npx.cmd --yes supabase stop *> $null
      if ($LASTEXITCODE -ne 0) { Write-Warning 'Local Supabase did not stop cleanly; check Docker Desktop.' }
    } catch {
      Write-Warning 'Local Supabase did not stop cleanly; check Docker Desktop.'
    } finally { Pop-Location }
  }
  $suiteState = @{}
  foreach ($row in $results) { $suiteState[$row.Suite] = $row.Result }
  $fullCaseResults = @{}
  $playwrightJson = Join-Path $reportDir 'playwright.json'
  if (Test-Path $playwrightJson) {
    try {
      $playwrightReport = Get-Content -LiteralPath $playwrightJson -Raw | ConvertFrom-Json
      foreach ($suite in $playwrightReport.suites) {
        foreach ($spec in $suite.specs) {
          if ($spec.title -match '^\[([A-Z]+-\d+)(:partial)?\] ') {
            $caseId = $matches[1]
            $isPartialCase = [bool]$matches[2]
            $statuses = @($spec.tests | ForEach-Object { $_.results | ForEach-Object { $_.status } })
            $specResult = if ($statuses.Count -gt 0 -and @($statuses | Where-Object { $_ -ne 'passed' }).Count -eq 0) { if ($isPartialCase) { 'PARTIAL PASS' } else { 'PASS' } } else { if ($isPartialCase) { 'PARTIAL FAIL' } else { 'FAIL' } }
            if ($fullCaseResults[$caseId] -ne 'FAIL') { $fullCaseResults[$caseId] = $specResult }
          }
        }
      }
    } catch { Write-Warning 'Could not parse Playwright case results.' }
  }
  $caseLines = @('# AquaCare test case matrix', '', 'This file distinguishes partial automated checks from full system test cases.', '', '| ID | Source | Status | Automated evidence |', '|---|---|---|---|')
  $caseSources = @(
    @{ Path = (Join-Path $root 'docs\testing\AQUACARE_SYSTEM_TEST_CASES.md'); Label = 'Original 178' },
    @{ Path = (Join-Path $root 'docs\testing\AQUACARE_TEST_CASES_ADDENDUM_2026-10-28.md'); Label = 'New addendum' }
  )
  $partialChecks = @{
    'UPD-01' = @{ Suite = 'Flutter mobile widget tests'; Detail = 'older build blocks app content' }
    'UPD-02' = @{ Suite = 'Flutter mobile widget tests'; Detail = 'minimum build comparison' }
    'UPD-05' = @{ Suite = 'Flutter mobile widget tests'; Detail = 'invalid manifest and failed check block app' }
    'UPD-06' = @{ Suite = 'Flutter mobile widget tests'; Detail = 'resumed lifecycle rechecks minimum build' }
    'GUIDE-01' = @{ Suite = 'Playwright web desktop and phone smoke tests'; Detail = 'guide visible on desktop/phone' }
    'GUIDE-02' = @{ Suite = 'Playwright web desktop and phone smoke tests'; Detail = 'video element on phone' }
    'MSET-02' = @{ Suite = 'Flutter mobile widget tests'; Detail = 'empty, short and reused password validation' }
    'SAFE-01' = @{ Suite = 'Backend unit and safety tests'; Detail = 'backend URL and credential guard' }
  }
  $caseCount = 0
  foreach ($source in $caseSources) {
    foreach ($line in (Get-Content -LiteralPath $source.Path)) {
      if ($line -match '^\| ([A-Z]+-\d+) \|') {
        $caseCount++
        $id = $matches[1]
        $state = 'NOT RUN IN FULL'
        $evidence = '-'
        if ($fullCaseResults.ContainsKey($id)) {
          $state = $fullCaseResults[$id]
          $evidence = "Playwright case; evidence in test-results/evidence/$id/"
        } elseif ($partialChecks.ContainsKey($id)) {
          $check = $partialChecks[$id]
          $evidence = $check.Detail
          if ($suiteState[$check.Suite] -eq 'PASS') { $state = 'PARTIAL PASS' }
          elseif ($suiteState[$check.Suite] -eq 'FAIL') { $evidence = "$($check.Detail); suite has another failing test" }
        }
        $caseLines += "| $id | $($source.Label) | $state | $evidence |"
      }
    }
  }
  Set-Content -LiteralPath (Join-Path $reportDir 'case-matrix.md') -Value $caseLines -Encoding UTF8
  $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
  $lines = @('# AquaCare isolated test run', '', "Run: $timestamp (local time)", '', '| Suite | Result | Seconds |', '|---|---|---:|')
  foreach ($row in $results) { $lines += "| $($row.Suite) | $($row.Result) | $($row.Seconds) |" }
  $lines += @('', "Case matrix: $caseCount cases in test-results/case-matrix.md. Only ID-tagged full system tests can be marked PASS or FAIL.", 'PARTIAL PASS is not a full case PASS. The remaining system cases have not been fully run.', 'No production database, MQTT broker, email provider, Firebase project, or physical relay is used by this runner.')
  Set-Content -LiteralPath (Join-Path $reportDir 'latest.md') -Value $lines -Encoding UTF8
  Write-Host "`nReport: $reportDir\latest.md"
  if ($results.Where({ $_.Result -ne 'PASS' }).Count -gt 0) { exit 1 }
}
