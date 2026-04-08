$currentPath = Get-Location
$env:OPENCLAW_HOME = "$currentPath"
$env:OPENCLAW_CONFIG_PATH = "$currentPath\openclaw.json"

Get-Content .env | ForEach-Object {
    if ($_ -match '^\s*#' -or $_ -match '^\s*$') { return }
    $key, $value = $_ -split '=', 2
    [Environment]::SetEnvironmentVariable($key.Trim(), $value.Trim(), 'Process')
}

if (!(Test-Path "workspace")) { New-Item -ItemType Directory -Path "workspace" }

Write-Host "`n--- OpenCLAW Environment Variables ---" -ForegroundColor Cyan
Get-ChildItem Env: | Where-Object { $_.Name -match 'OPENCLAW|OPENAI|DISCORD|NODE' } | Sort-Object Name | ForEach-Object {
    $val = if ($_.Name -match 'KEY|TOKEN|SECRET') { "$($_.Value.Substring(0, [Math]::Min(4, $_.Value.Length)))****" } else { $_.Value }
    Write-Host "  $($_.Name) = $val"
}
Write-Host "--------------------------------------`n" -ForegroundColor Cyan

if ($args.Count -eq 0) {
	npx openclaw gateway
}
else {
	npx openclaw @args
}