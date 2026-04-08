### OpenClaw Service & Task Checker ###
Write-Host "Checking for OpenClaw installation status..." -ForegroundColor Cyan

# 1. Check for Scheduled Task (The most common "Service" mode on Windows)
$taskName = "OpenClaw Gateway"
$task = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue

if ($task) {
    $status = (Get-ScheduledTask -TaskName $taskName).State
    Write-Host "[✓] Scheduled Task Found: '$taskName'" -ForegroundColor Green
    Write-Host "    Status: $status"
} else {
    Write-Host "[ ] No Scheduled Task found for '$taskName'." -ForegroundColor Yellow
}

# 2. Check for Windows Service (If installed via --install-daemon)
$serviceName = "OpenClaw"
$service = Get-Service -Name $serviceName -ErrorAction SilentlyContinue

if ($service) {
    Write-Host "[✓] Windows Service Found: '$serviceName'" -ForegroundColor Green
    Write-Host "    Status: $($service.Status)"
} else {
    Write-Host "[ ] No Windows Service found for '$serviceName'." -ForegroundColor Yellow
}

# 3. Check for Global CLI (Is it even in your PATH?)
$openclawPath = Get-Command openclaw -ErrorAction SilentlyContinue

if ($openclawPath) {
    Write-Host "[✓] OpenClaw CLI is available in PATH." -ForegroundColor Green
    Write-Host "    Location: $($openclawPath.Source)"
    
    # Try to run the internal status check
    Write-Host "--- Internal OpenClaw Status ---"
    openclaw gateway status
} else {
    Write-Host "[!] OpenClaw CLI NOT found in PATH. You may need to run 'npm install -g openclaw'." -ForegroundColor Red
}

Write-Host "`nCheck complete." -ForegroundColor Cyan