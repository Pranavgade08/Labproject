<?php
session_start();
include "db.php";

// Check if any user (student or admin) is logged in
if (!isset($_SESSION['admin']) && !isset($_SESSION['student'])) {
    header("Location: login.php");
    exit();
}

$message = '';
$message_type = '';

// Handle IP shutdown request
if (isset($_POST['shutdown_ip'])) {
    $target_ip = trim($_POST['target_ip']);
    
    // Validate IP
    if (filter_var($target_ip, FILTER_VALIDATE_IP)) {
        // Execute shutdown/restart command targeting the remote machine
        $action_flag = (isset($_POST['action']) && $_POST['action'] === 'restart') ? '/r' : '/s';
        $shutdown_command = "shutdown $action_flag /m \\\\" . $target_ip . " /t 0 /f 2>&1";
        $output = shell_exec($shutdown_command);
        
        if (strpos($output, 'Access is denied.') !== false) {
            $message = "Failed to shutdown $target_ip: Access Denied. Administrator rights required.";
            $message_type = 'error';
        } elseif (trim($output) == '') {
            $message = "Shutdown command sent to $target_ip successfully.";
            $message_type = 'success';
        } else {
            $message = "Command output for $target_ip: " . htmlspecialchars($output);
            $message_type = 'error';
        }
    } else {
        $message = "Invalid IP Address.";
        $message_type = 'error';
    }
}

// Handle bulk shutdown request
if (isset($_POST['shutdown_all'])) {
    $devices = get_network_devices(); // Get current active devices
    $success_count = 0;
    $fail_count = 0;
    
    foreach ($devices as $device) {
        if ($device['os'] !== 'Offline / Unreachable' && strpos($device['os'], 'Windows') !== false) {
            $target_ip = $device['ip'];
            $shutdown_command = "shutdown /s /m \\\\" . $target_ip . " /t 0 /f 2>&1";
            $output = shell_exec($shutdown_command);
            
            if (strpos($output, 'Access is denied.') !== false || strpos($output, 'Logon failure') !== false) {
                $fail_count++;
            } else {
                $success_count++;
            }
        }
    }
    
    $message = "Mass Shutdown Complete. Sent to $success_count devices. Failed on $fail_count devices due to access/offline.";
    $message_type = $fail_count > 0 ? 'warning' : 'success';
}

// Function to scan local network (using ARP cache)
function get_network_devices() {
    global $conn; // Access the database connection string
    $devices = [];
    
    // Get ARP table
    $arp_output = shell_exec('arp -a');
    $lines = explode("\n", $arp_output);
    
    foreach ($lines as $line) {
        // Match IP and MAC address format standard in Windows arp -a output
        if (preg_match('/^\s*([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)\s+([0-9a-fA-F-]+)\s+(\w+)/', $line, $matches)) {
            $ip = $matches[1];
            $mac = $matches[2];
            $type = $matches[3];
            
            // Skip broadcast or multicast IPs
            if ($ip == '255.255.255.255' || strpos($ip, '224.') === 0 || strpos($ip, '239.') === 0) {
                continue;
            }

            // Estimate OS based on Ping TTL (Time To Live)
            $os = "Unknown";
            $hostname = "Unknown Host";
            
            // Ping to get TTL (timeout 1 second)
            $ping_output = shell_exec("ping -n 1 -w 1000 " . escapeshellarg($ip));
            
            if ($ping_output && preg_match('/TTL=(\d+)/i', $ping_output, $ttl_match)) {
                $ttl = (int)$ttl_match[1];
                if ($ttl <= 64) {
                    $os = "Linux / Mac";
                } elseif ($ttl <= 128) {
                    $os = "Windows";
                } elseif ($ttl <= 255) {
                    $os = "Cisco / Network Device";
                }
                
                // Try resolving hostname only if device responds to ping to avoid hanging
                $resolved_name = @gethostbyaddr($ip);
                if ($resolved_name !== $ip && $resolved_name !== false) {
                    $hostname = $resolved_name;
                }
            } else {
                 $os = "Offline / Unreachable";
            }

            // Automatically update database with the discovered device
            if ($mac) {
                $status = ($os === 'Offline / Unreachable') ? 'Offline' : 'Online';
                // Note: IP Address could change if DHCP is active, hence ON DUPLICATE KEY UPDATE ip_address
                $stmt = mysqli_prepare($conn, "
                    INSERT INTO computers (name, ip_address, mac_address, os, status) 
                    VALUES (?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE 
                    ip_address = VALUES(ip_address), 
                    name = IF(VALUES(name) != 'Unknown Host', VALUES(name), name),
                    os = VALUES(os),
                    status = VALUES(status), 
                    last_seen = CURRENT_TIMESTAMP
                ");
                
                $mac_db = strtoupper(str_replace('-', ':', $mac));
                mysqli_stmt_bind_param($stmt, "sssss", $hostname, $ip, $mac_db, $os, $status);
                mysqli_stmt_execute($stmt);
                mysqli_stmt_close($stmt);
            }

            $devices[] = [
                'ip' => $ip,
                'mac' => strtoupper(str_replace('-', ':', $mac)),
                'type' => $type,
                'os' => $os,
                'hostname' => $hostname
            ];
        }
    }
    
    // Mark PCs offline that haven't been seen recently
    // E.g., not seen in the last 15 minutes (900 seconds)
    mysqli_query($conn, "UPDATE computers SET status = 'Offline' WHERE last_seen < NOW() - INTERVAL 15 MINUTE");
    
    return $devices;
}

$network_devices = get_network_devices();
?>
<!DOCTYPE html>
<html>
<head>
    <title>Network Management | LabTrack</title>
    <link rel="stylesheet" href="css/clean-style.css">
    <style>
        .device-card {
            background: #fff;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-left: 4px solid #3b82f6;
        }
        .os-badge {
            background: #f1f5f9;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            color: #475569;
        }
        .os-windows { background: #e0f2fe; color: #0284c7; }
        .os-linux { background: #fef3c7; color: #d97706; }
        .device-info h4 { margin: 0 0 5px 0; color: #1e293b; }
        .device-info p { margin: 0; color: #64748b; font-size: 13px; }
        .btn-shutdown {
            background-color: #ef4444;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
            transition: background 0.2s;
        }
        .btn-shutdown:hover {
            background-color: #dc2626;
        }
    </style>
</head>
<body>

<?php include 'components/header.php'; ?>

<div class="main-content">
    <div class="card">
        <div class="card-header">
            <h2 class="card-title">Network Management</h2>
            <p class="card-subtitle">Detect active LAN computers and manage them remotely.</p>
        </div>

        <?php if ($message): ?>
            <div class="alert alert-<?php echo $message_type; ?>">
                <?php echo $message; ?>
            </div>
        <?php endif; ?>

        <div style="margin-bottom: 20px; display: flex; gap: 15px;">
            <button onclick="location.reload()" class="btn btn-primary" style="display: flex; align-items: center; gap: 8px;">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                Rescan Network
            </button>
            
            <form method="POST" onsubmit="return confirm('WARNING: This will attempt to shutdown ALL active Windows PCs in the lab. Are you absolutely sure?');" style="margin: 0;">
                <button type="submit" name="shutdown_all" class="btn btn-secondary" style="background-color: #ef4444; color: white; border: none; display: flex; align-items: center; gap: 8px;">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    Shutdown All PCs
                </button>
            </form>
            
        </div>
        <small style="color: #64748b; margin-left: 10px; display: block; margin-bottom: 15px;">Scans ARP cache and pings discovered IPs. Takes a few seconds.</small>

        <div class="table-responsive">
            <table width="100%" class="modern-table">
                <thead>
                    <tr>
                        <th>Hostname</th>
                        <th>IP Address</th>
                        <th>MAC Address</th>
                        <th>Estimated OS</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (empty($network_devices)): ?>
                        <tr>
                            <td colspan="5" style="text-align: center; padding: 20px;">No devices discovered in ARP cache.</td>
                        </tr>
                    <?php else: ?>
                        <?php foreach ($network_devices as $device): ?>
                            <tr>
                                <td>
                                    <strong><?php echo htmlspecialchars($device['hostname']); ?></strong>
                                    <?php if ($device['type'] == 'static'): ?>
                                        <span class="os-badge" style="margin-left:5px;">Static</span>
                                    <?php endif; ?>
                                </td>
                                <td><?php echo htmlspecialchars($device['ip']); ?></td>
                                <td style="font-family: monospace;"><?php echo htmlspecialchars($device['mac']); ?></td>
                                <td>
                                    <?php 
                                        $os_class = '';
                                        if (strpos($device['os'], 'Windows') !== false) $os_class = 'os-windows';
                                        elseif (strpos($device['os'], 'Linux') !== false || strpos($device['os'], 'Mac') !== false) $os_class = 'os-linux';
                                    ?>
                                    <span class="os-badge <?php echo $os_class; ?>"><?php echo htmlspecialchars($device['os']); ?></span>
                                </td>
                                <td>
                                    <form method="POST" onsubmit="return confirm('Are you sure you want to send a shutdown command to <?php echo htmlspecialchars($device['ip']); ?>?');" style="margin:0; display:inline-block;">
                                        <input type="hidden" name="target_ip" value="<?php echo htmlspecialchars($device['ip']); ?>">
                                        <button type="submit" name="shutdown_ip" class="btn-shutdown" <?php echo $device['os'] == 'Offline / Unreachable' ? 'disabled style="opacity: 0.5; cursor: not-allowed;" title="Device is offline"' : ''; ?>>Shutdown</button>
                                    </form>
                                    <form method="POST" onsubmit="return confirm('Are you sure you want to restart <?php echo htmlspecialchars($device['ip']); ?>?');" style="margin:0; display:inline-block;">
                                        <input type="hidden" name="target_ip" value="<?php echo htmlspecialchars($device['ip']); ?>">
                                        <input type="hidden" name="action" value="restart">
                                        <button type="submit" name="shutdown_ip" class="btn-shutdown" style="background-color: #f59e0b;" <?php echo $device['os'] == 'Offline / Unreachable' ? 'disabled style="opacity: 0.5; cursor: not-allowed;" title="Device is offline"' : ''; ?>>Restart</button>
                                    </form>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
        
        <div style="margin-top: 30px; padding: 15px; background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 4px;">
            <h4 style="margin-top: 0; color: #b45309;">Important Requirements for Remote Shutdown</h4>
            <ul style="color: #92400e; font-size: 13px; margin-bottom: 0;">
                <li>The target machine must be running Windows.</li>
                <li>The "Remote Registry" service must be running on the target machine.</li>
                <li>File and Printer Sharing must be enabled on the target machine.</li>
                <li>The web server executing this script must be running under an account that has <strong>Administrator</strong> privileges on the target machine (e.g., Domain Admin, or matching local admin credentials).</li>
                <li>Without correct permissions, the command will return an "Access is denied" error.</li>
            </ul>
        </div>
    </div>
</div>

<?php include 'components/footer.php'; ?>

</body>
</html>
