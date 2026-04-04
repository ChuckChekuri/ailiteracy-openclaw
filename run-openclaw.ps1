$currentPath = Get-Location
$env:OPENCLAW_HOME = "$currentPath"
$env:OPENCLAW_CONFIG_PATH = "$currentPath\openclaw.json"

if (!(Test-Path "workspace")) { New-Item -ItemType Directory -Path "workspace" }

# Load .env file into the session
$envFile = "$currentPath\.env"
if (Test-Path $envFile) {
    Get-Content $envFile | Where-Object { $_ -match '=' -and $_ -notmatch '^#' } | ForEach-Object {
        $name, $value = $_.Split('=', 2)
        [Environment]::SetEnvironmentVariable($name.Trim(), $value.Trim(), 'Process')
    }
}

if ($args.Count -eq 0) {
	npx openclaw gateway
}
else {
	npx openclaw @args
}
