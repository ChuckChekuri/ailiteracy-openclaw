$currentPath = Get-Location
$env:OPENCLAW_HOME = "$currentPath\state"
$env:OPENCLAW_CONFIG_PATH = "$currentPath\openclaw.json"

if (!(Test-Path "state")) { New-Item -ItemType Directory -Path "state" }
if (!(Test-Path "workspace")) { New-Item -ItemType Directory -Path "workspace" }

npx openclaw @args
