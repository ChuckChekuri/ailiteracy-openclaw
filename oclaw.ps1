$currentPath = Get-Location
$env:OPENCLAW_HOME = "$currentPath"
$env:OPENCLAW_CONFIG_PATH = "$currentPath\openclaw.json"

Get-Content .env | ForEach-Object {
    if ($_ -match '^\s*#' -or $_ -match '^\s*$') { return }
    $key, $value = $_ -split '=', 2
    [Environment]::SetEnvironmentVariable($key.Trim(), $value.Trim(), 'Process')
}

if (!(Test-Path "workspace")) { New-Item -ItemType Directory -Path "workspace" }

if ($args.Count -eq 0) {
	npx openclaw gateway
}
else {
	npx openclaw @args
}