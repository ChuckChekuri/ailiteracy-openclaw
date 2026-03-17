$currentPath = Get-Location
$env:OPENCLAW_HOME = "$currentPath"
$env:OPENCLAW_CONFIG_PATH = "$currentPath\openclaw.json"

if (!(Test-Path "workspace")) { New-Item -ItemType Directory -Path "workspace" }

if ($args.Count -eq 0) {
	npx openclaw gateway
}
else {
	npx openclaw @args
}
