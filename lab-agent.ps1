# LabTrack Windows Agent Script (MERN Edition)
# This script should be deployed on lab workstations (via Group Policy, Task Scheduler, or Startup Script)
# It transmits PC status, heartbeat, and installed software catalog to the Node.js / Express backend

$ServerUrl = "http://localhost:5000/api/agent"

# Function to get active MAC Address
function Get-MacAddress {
    $Adapter = Get-WmiObject Win32_NetworkAdapterConfiguration | Where-Object { $_.IPEnabled -eq $true } | Select-Object -First 1
    return $Adapter.MACAddress
}

# Function to get Hostname
function Get-Hostname {
    return $env:COMPUTERNAME
}

# Function to get OS Version
function Get-OSVersion {
    $OS = Get-WmiObject Win32_OperatingSystem
    return $OS.Caption
}

# Function to get Installed Software (from Registry)
function Get-InstalledSoftware {
    $SoftwareList = @()
    $Paths = @(
        "HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*",
        "HKLM:\Software\Wow6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*"
    )
    
    foreach ($Path in $Paths) {
        $Keys = Get-ItemProperty $Path -ErrorAction SilentlyContinue | Where-Object { $_.DisplayName -ne $null }
        foreach ($Key in $Keys) {
            $SoftwareList += @{
                name = $Key.DisplayName
                version = if ($Key.DisplayVersion) { $Key.DisplayVersion } else { "Unknown" }
            }
        }
    }
    
    return $SoftwareList | Sort-Object name -Unique
}

# Send Heartbeat or Startup/Shutdown event
function Send-Event ($ActionType) {
    $Payload = @{
        action = $ActionType
        mac_address = Get-MacAddress
        hostname = Get-Hostname
        os = Get-OSVersion
        details = "Event: $ActionType triggering at $(Get-Date)"
    }
    
    $JsonPayload = $Payload | ConvertTo-Json
    
    try {
        Invoke-RestMethod -Uri $ServerUrl -Method Post -Body $JsonPayload -ContentType "application/json" -ErrorAction Stop
        Write-Host "Successfully sent $ActionType event to LabTrack Server."
    } catch {
        Write-Warning "Failed to send $ActionType event: $_"
    }
}

# Send Software Catalog
function Send-SoftwareReport {
    $Software = Get-InstalledSoftware
    $Payload = @{
        action = "software_report"
        mac_address = Get-MacAddress
        hostname = Get-Hostname
        os = Get-OSVersion
        software = $Software
    }
    
    $JsonPayload = $Payload | ConvertTo-Json -Depth 3
    
    try {
        Invoke-RestMethod -Uri $ServerUrl -Method Post -Body $JsonPayload -ContentType "application/json" -ErrorAction Stop
        Write-Host "Successfully sent software catalog report to LabTrack Server."
    } catch {
        Write-Warning "Failed to send software report: $_"
    }
}

# Main Execution
$Action = $args[0]
if (-not $Action) {
    $Action = "heartbeat"
}

switch ($Action) {
    "startup" {
        Send-Event "startup"
        Send-SoftwareReport
    }
    "shutdown" {
        Send-Event "shutdown"
    }
    "software" {
        Send-SoftwareReport
    }
    "heartbeat" {
        Send-Event "heartbeat"
    }
    default {
        Write-Host "Usage: .\lab-agent.ps1 [startup|shutdown|software|heartbeat]"
    }
}
