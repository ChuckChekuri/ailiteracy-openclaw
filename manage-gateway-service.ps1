<#
.SYNOPSIS
Manages the OpenClaw Gateway as a Windows service using NSSM (the Non-Sucking Service Manager).
This script provides a safe, interactive way to install, start, stop, restart, check the status of, and remove the service.

.DESCRIPTION
This script is designed for students in the CSUF CPSC 481.07 AI Literacy course to safely manage their OpenClaw agent as a background service on Windows.

It performs the following key functions:
- Checks for the presence of NSSM and provides download instructions if it's missing.
- Interactively prompts for commands: install, start, stop, restart, status, remove.
- Before installation, it requires explicit user confirmation to prevent accidental changes.
- Configures the 'OpenClawGateway' service to run 'npm run start' under the current user's context.
- Centralizes service logs in '.\logs\gateway-service.log'.
- Uses colored output for clear, user-friendly messages and warnings.
- Requires running as Administrator for 'install' and 'remove' commands to ensure proper permissions.

.PARAMETER Command
The action to perform. Must be one of: install, start, stop, restart, status, remove.

.EXAMPLE
PS C:\projects\openclaw> .\manage-gateway-service.ps1 -Command install
(Run as Administrator) Installs the OpenClaw Gateway as a Windows service after user confirmation.

.EXAMPLE
PS C:\projects\openclaw> .\manage-gateway-service.ps1 -Command status
Checks and displays the current status of the 'OpenClawGateway' service.

.EXAMPLE
PS C:\projects\openclaw> .\manage-gateway-service.ps1 -Command remove
(Run as Administrator) Stops and safely removes the 'OpenClawGateway' service after user confirmation.
#>
[CmdletBinding()]
param (
    [Parameter(Mandatory = $true, HelpMessage = "The command to execute. Valid options are: install, start, stop, restart, status, remove")]
    [ValidateSet('install', 'start', 'stop', 'restart', 'status', 'remove')]
    [string]$Command
)

# --- Script Configuration ---
$ServiceName = "OpenClawGateway"
$ServiceDisplayName = "OpenClaw Gateway"
$ServiceDescription = "Manages the OpenClaw agent gateway for the CSUF AI Literacy course. Runs 'npm run start' in the background."
$ProjectRoot = $PSScriptRoot
$LogDirectory = Join-Path -Path $ProjectRoot -ChildPath "logs"
$LogFile = Join-Path -Path $LogDirectory -ChildPath "gateway-service.log"
$NodePath = Get-Command node | Select-Object -ExpandProperty Source
$NpmPath = Get-Command npm | Select-Object -ExpandProperty Source
$StartupCommand = $NpmPath
$StartupArguments = "run start"

# --- Helper Functions ---
function Write-Host-Color($Message, $Color) {
    Write-Host $Message -ForegroundColor $Color
}

function Test-IsAdmin {
    $identity = [System.Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object System.Security.Principal.WindowsPrincipal($identity)
    return $principal.IsInRole([System.Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Test-Nssm {
    $nssmPath = Get-Command nssm -ErrorAction SilentlyContinue
    if ($null -eq $nssmPath) {
        Write-Host-Color "-----------------------------------------------------------------" -Color Yellow
        Write-Host-Color "ERROR: NSSM (Non-Sucking Service Manager) not found in your PATH." -Color Red
        Write-Host-Color "NSSM is required to manage the gateway as a Windows service." -Color Yellow
        Write-Host ""
        Write-Host-Color "To install NSSM:" -Color Cyan
        Write-Host-Color "1. Download the latest release from: https://nssm.cc/download" -Color White
        Write-Host-Color "2. Extract the .zip file to a location like 'C:\nssm'." -Color White
        Write-Host-Color "3. Add the appropriate folder (e.g., 'C:\nssm\win64') to your system's PATH environment variable." -Color White
        Write-Host-Color "4. Restart your terminal and run this script again." -Color White
        Write-Host-Color "-----------------------------------------------------------------" -Color Yellow
        return $false
    }
    return $true
}

function Confirm-Action($Action) {
    $prompt = "Are you sure you want to $($Action.ToUpper()) the '$ServiceName' service? (Yes/No): "
    while ($true) {
        $response = Read-Host -Prompt $prompt
        if ($response.ToLower() -eq 'yes') {
            return $true
        }
        if ($response.ToLower() -eq 'no') {
            return $false
        }
    }
}

# --- Main Logic ---
if (-not (Test-Nssm)) {
    exit 1
}

if (($Command -eq "install" -or $Command -eq "remove") -and -not (Test-IsAdmin)) {
    Write-Host-Color "ERROR: The '$Command' command requires Administrator privileges." -Color Red
    Write-Host-Color "Please re-run this script from a PowerShell terminal running as Administrator." -Color Yellow
    exit 1
}


switch ($Command) {
    "install" {
        Write-Host-Color "--- Service Installation Details ---" -Color Cyan
        Write-Host "Service Name:       $ServiceName"
        Write-Host "Display Name:       $ServiceDisplayName"
        Write-Host "Run as User:        $env:USERNAME"
        Write-Host "Project Root:       $ProjectRoot"
        Write-Host "Command:            $StartupCommand $StartupArguments"
        Write-Host "Log File:           $LogFile"
        Write-Host-Color "------------------------------------" -Color Cyan
        Write-Host ""

        if (Confirm-Action "install") {
            Write-Host-Color "Installing service '$ServiceName'..." -Color Green
            # Ensure log directory exists
            if (-not (Test-Path -Path $LogDirectory)) {
                New-Item -Path $LogDirectory -ItemType Directory | Out-Null
            }
            
            # Stop service if it exists to prevent errors on re-installation
            nssm stop $ServiceName 2>&1 | Out-Null

            nssm install $ServiceName """$StartupCommand""" $StartupArguments
            nssm set $ServiceName AppDirectory $ProjectRoot
            nssm set $ServiceName DisplayName $ServiceDisplayName
            nssm set $ServiceName Description $ServiceDescription
            nssm set $ServiceName ObjectName $env:USERDOMAIN\$env:USERNAME
            nssm set $ServiceName AppStdout $LogFile
            nssm set $ServiceName AppStderr $LogFile
            nssm set $ServiceName AppRotateFiles 1
            nssm set $ServiceName AppRotateSeconds 86400 # 24 hours
            nssm set $ServiceName AppRotateBytes 1048576 # 1 MB
            
            # Set environment variables for the service
            $envPath = "PATH=$($env:PATH);$(Split-Path $NodePath -Parent)"
            nssm set $ServiceName AppEnvironmentExtra $envPath

            Write-Host-Color "Service '$ServiceName' installed successfully." -Color Green
            Write-Host "To start it, run: .\manage-gateway-service.ps1 -Command start"
        } else {
            Write-Host-Color "Installation cancelled by user." -Color Yellow
        }
    }
    "start" {
        Write-Host-Color "Starting service '$ServiceName'..." -Color Green
        nssm start $ServiceName
        Start-Sleep -Seconds 1
        nssm status $ServiceName
    }
    "stop" {
        Write-Host-Color "Stopping service '$ServiceName'..." -Color Yellow
        nssm stop $ServiceName
        Start-Sleep -Seconds 1
        nssm status $ServiceName
    }
    "restart" {
        Write-Host-Color "Restarting service '$ServiceName'..." -Color Cyan
        nssm restart $ServiceName
        Start-Sleep -Seconds 1
        nssm status $ServiceName
    }
    "status" {
        Write-Host-Color "Checking status of service '$ServiceName'..." -Color Cyan
        nssm status $ServiceName
    }
    "remove" {
        Write-Host-Color "WARNING: This will permanently remove the '$ServiceName' service." -Color Red
        if (Confirm-Action "remove") {
            Write-Host-Color "Stopping and removing service '$ServiceName'..." -Color Yellow
            nssm stop $ServiceName 2>&1 | Out-Null
            nssm remove $ServiceName confirm
            Write-Host-Color "Service '$ServiceName' removed successfully." -Color Green
        } else {
            Write-Host-Color "Removal cancelled by user." -Color Yellow
        }
    }
}
