# Running OpenClaw as a Windows Service

This guide explains how to run the OpenClaw Gateway as a background Windows service using `NSSM` (the Non-Sucking Service Manager) and the provided `manage-gateway-service.ps1` PowerShell script. This is the recommended approach for running your agent for the CPSC 481.07 AI Literacy course, as it ensures your agent is always running and resilient.

## What is NSSM and Why Use It?

NSSM is a utility that helps you run any application as a Windows service. We use it for a few key reasons:
- **Resilience**: It automatically restarts the gateway if it crashes, ensuring your agent stays online.
- **Convenience**: It runs in the background, so you don't need to keep a terminal window open.
- **Control**: It provides simple commands to start, stop, and manage the gateway process safely.
- **Logging**: It captures all console output to a log file, which is essential for debugging.

## Step 1: Download and Install NSSM

The `manage-gateway-service.ps1` script requires NSSM to be installed and available in your system's PATH.

1.  **Download NSSM**: Go to the official NSSM download page and get the latest release:
    [https://nssm.cc/download](https://nssm.cc/download)

2.  **Extract the Archive**: Extract the `.zip` file to a permanent, simple location on your computer, such as `C:\nssm`.

3.  **Add NSSM to your PATH**:
    - Open the Start Menu, type `env`, and select "Edit the system environment variables".
    - Click the "Environment Variables..." button.
    - Under "System variables", find and select the `Path` variable, then click "Edit...".
    - Click "New" and add the path to the NSSM executable for your system (e.g., `C:\nssm\win64`).
    - Click OK to close all dialogs.

4.  **Verify Installation**: Open a **new** PowerShell terminal and run `nssm --version`. If it prints a version number, you're all set. If not, restart your computer and try again.

## Step 2: Use the `manage-gateway-service.ps1` Script

This script is the safe, recommended way to manage the service. **Open a PowerShell terminal as an Administrator** in the root of this repository to use it.

**Safety First**: The script will always explain what it's about to do and ask for your confirmation before making any changes to your system.

### Install the Service

This command configures the service but does not start it. It will run under your current user account, which is a key safety feature.

```powershell
# Run this in a terminal with Administrator privileges
.\manage-gateway-service.ps1 -Command install
```

### Start the Service

This starts the OpenClaw Gateway in the background.

```powershell
.\manage-gateway-service.ps1 -Command start
```

### Check the Service Status

This shows whether the service is running, stopped, or has encountered an error.

```powershell
.\manage-gateway-service.ps1 -Command status
```

### Stop the Service

This stops the background gateway process.

```powershell
.\manage-gateway-service.ps1 -Command stop
```

### Restart the Service

This is a convenient way to stop and then immediately start the service, which is useful after making configuration changes to your agent.

```powershell
.\manage-gateway-service.ps1 -Command restart
```

### Remove the Service

This command will safely stop the service and completely remove it from your system.

```powershell
# Run this in a terminal with Administrator privileges
.\manage-gateway-service.ps1 -Command remove
```

## Safety Warnings

- **Run as Standard User**: The service is configured to run as your current user, not as a system administrator (`LocalSystem`). This is a critical safety feature that limits the service's permissions to only what your user account can do. Do not change this setting.
- **Administrator for Install/Remove**: You need to run PowerShell as an Administrator *only* for the `install` and `remove` commands. This is because creating and deleting services are protected system operations. For `start`, `stop`, `restart`, and `status`, you can use a standard terminal.
- **Monitor Logs**: The service's console output is automatically saved to `.\logs\gateway-service.log`. If your agent isn't behaving as expected, this log file is the first place you should look. It contains startup information, error messages, and other important diagnostics.
- **Easy Removal**: If you no longer want the service or need to reinstall it, use the `remove` command. It's the cleanest and safest way to undo the installation.

## Troubleshooting

- **"NSSM not found"**: This means you haven't added NSSM to your system's PATH correctly. Double-check the path you added and restart your terminal.
- **Service Fails to Start**: Check the `.\logs\gateway-service.log` file for error messages. Common issues include an incorrect `.env` configuration, problems with `npm install`, or the port being in use by another application.
- **"Access Denied"**: Ensure you are running PowerShell as an administrator when you use the `install` or `remove` commands.
- **Node/NPM not found in service**: The script automatically detects your Node.js and NPM installation and provides it to the service's environment. If you have issues, ensure `node.exe` and `npm.cmd` are in your system PATH.
