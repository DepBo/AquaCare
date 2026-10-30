param([switch]$V2)
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$reportDir = Join-Path $root $(if ($V2) { 'test-results\quick-v2' } else { 'test-results\quick' })
$expectedBackend = if ($V2) { 30 } else { 21 }
$expectedFlutter = if ($V2) { 83 } else { 76 }
New-Item -ItemType Directory -Path $reportDir -Force | Out-Null
$originalOutputEncoding = [Console]::OutputEncoding
[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)

try {
  Write-Host "Running $expectedBackend backend tests..." -ForegroundColor Cyan
  Push-Location (Join-Path $root 'AquaCare_Backend')
  try {
    if ($V2) {
      $testFiles = @(Get-ChildItem -LiteralPath .\test, .\tests, .\test_v2 -Filter '*.test.js' -File | Select-Object -ExpandProperty FullName)
      & node.exe --test @testFiles 2>&1 | ForEach-Object { $line = [string]$_; Write-Host $line; $line } |
        Out-File -LiteralPath (Join-Path $reportDir 'backend.log') -Encoding utf8
    } else {
      & npm.cmd run test:all 2>&1 | ForEach-Object { $line = [string]$_; Write-Host $line; $line } |
        Out-File -LiteralPath (Join-Path $reportDir 'backend.log') -Encoding utf8
    }
    $backendExit = $LASTEXITCODE
  } finally { Pop-Location }

  Write-Host "Running $expectedFlutter Flutter tests..." -ForegroundColor Cyan
  $testNames = @{}
  Push-Location (Join-Path $root 'AquaCare_App')
  try {
    $showFlutterResult = {
      $line = [string]$_
      try {
        $event = $line | ConvertFrom-Json
        if ($event.type -eq 'testStart') { $testNames[[string]$event.test.id] = $event.test.name }
        if ($event.type -eq 'testDone' -and -not $event.hidden) {
          $name = $testNames[[string]$event.testID]
          if ($event.result -eq 'success') { Write-Host "  $([char]0x2714) $name" -ForegroundColor Green }
          elseif ($event.skipped) { Write-Host "  - $name (SKIP)" -ForegroundColor Yellow }
          else { Write-Host "  $([char]0x2716) $name" -ForegroundColor Red }
        }
        if ($event.type -eq 'error') { Write-Host "    $($event.error)" -ForegroundColor Red }
      } catch {
        if ($line.Trim()) { Write-Host $line }
      }
      $line
    }
    if ($V2) {
      & flutter.bat test test test_v2 --reporter json 2>&1 | ForEach-Object $showFlutterResult |
        Out-File -LiteralPath (Join-Path $reportDir 'flutter.jsonl') -Encoding utf8
    } else {
      & flutter.bat test --reporter json 2>&1 | ForEach-Object $showFlutterResult |
        Out-File -LiteralPath (Join-Path $reportDir 'flutter.jsonl') -Encoding utf8
    }
    $flutterExit = $LASTEXITCODE
  } finally { Pop-Location }

  & node.exe (Join-Path $PSScriptRoot 'build-quick-report.js') $backendExit $flutterExit $(if ($V2) { 'v2' } else { 'v1' })
  if ($LASTEXITCODE -ne 0) { exit 1 }
  Write-Host "Report: $reportDir\results.md" -ForegroundColor Green
  if ($backendExit -ne 0 -or $flutterExit -ne 0) { exit 1 }
} finally {
  [Console]::OutputEncoding = $originalOutputEncoding
}
