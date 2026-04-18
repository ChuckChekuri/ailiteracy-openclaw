# Dot-source this file to export .env variables into the current PowerShell session:
#   . .\setenv.ps1
#
# Do NOT run it directly (.\setenv.ps1) — that spawns a child scope and variables
# will not persist in your current terminal.

$EnvFile = Join-Path $PSScriptRoot ".env"

if (-not (Test-Path $EnvFile)) {
    Write-Error "Error: .env file not found at $EnvFile"
    return
}

foreach ($line in Get-Content $EnvFile) {
    # Skip blank lines and comments
    if ([string]::IsNullOrWhiteSpace($line) -or $line.TrimStart().StartsWith('#')) {
        continue
    }
    $parts = $line.SplitN('=', 2)
    if ($parts.Count -eq 2) {
        [System.Environment]::SetEnvironmentVariable($parts[0].Trim(), $parts[1].Trim(), 'Process')
        Set-Item -Path "Env:\$($parts[0].Trim())" -Value $parts[1].Trim()
    }
}

Write-Host "Environment variables loaded from $EnvFile"
