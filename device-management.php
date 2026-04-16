<?php
session_start();
include "db.php";

// Check if admin is logged in
if (!isset($_SESSION['admin'])) {
    header("Location: admin-login.php");
    exit();
}

$message = '';
$message_type = '';

// Handle device update
if (isset($_POST['update_device'])) {
    $device_id = (int)$_POST['device_id'];
    $lab_number = trim($_POST['lab_number']);
    
    $stmt = mysqli_prepare($conn, "UPDATE computers SET lab_number = ? WHERE id = ?");
    mysqli_stmt_bind_param($stmt, "si", $lab_number, $device_id);
    
    if (mysqli_stmt_execute($stmt)) {
        $message = "Device updated successfully.";
        $message_type = "success";
    } else {
        $message = "Error updating device.";
        $message_type = "error";
    }
    mysqli_stmt_close($stmt);
}

// Fetch all devices
$query = "SELECT * FROM computers ORDER BY last_seen DESC";
$result = mysqli_query($conn, $query);
$devices = [];
while ($row = mysqli_fetch_assoc($result)) {
    $devices[] = $row;
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>Device Management | LabTrack</title>
    <link rel="stylesheet" href="css/clean-style.css">
    <style>
        .status-badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
        }
        .status-online { background: #dcfce7; color: #166534; }
        .status-offline { background: #fee2e2; color: #991b1b; }
        
        /* Modal Styles */
        .modal {
            display: none;
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.5);
            align-items: center; justify-content: center;
            z-index: 1000;
        }
        .modal-content {
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            width: 100%;
            max-width: 400px;
        }
    </style>
</head>
<body>

<?php include 'components/header.php'; ?>

<div class="main-content">
    <div class="card">
        <div class="card-header">
            <h2 class="card-title">Device Management</h2>
            <p class="card-subtitle">Manage registered lab computers, assign labs, and view statuses.</p>
        </div>

        <?php if ($message): ?>
            <div class="alert alert-<?php echo $message_type; ?>">
                <?php echo $message; ?>
            </div>
        <?php endif; ?>

        <div class="table-responsive">
            <table width="100%" class="modern-table">
                <thead>
                    <tr>
                        <th>Hostname</th>
                        <th>IP Address</th>
                        <th>MAC Address</th>
                        <th>Lab Number</th>
                        <th>OS</th>
                        <th>Status</th>
                        <th>Last Seen</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (empty($devices)): ?>
                        <tr>
                            <td colspan="8" style="text-align: center; padding: 20px;">No devices have been discovered yet. Open <a href="network-management.php">Network Management</a> to scan the LAN.</td>
                        </tr>
                    <?php else: ?>
                        <?php foreach ($devices as $dev): ?>
                            <tr>
                                <td><strong><?php echo htmlspecialchars($dev['name']); ?></strong></td>
                                <td><?php echo htmlspecialchars($dev['ip_address']); ?></td>
                                <td style="font-family: monospace;"><?php echo htmlspecialchars($dev['mac_address']); ?></td>
                                <td><?php echo htmlspecialchars($dev['lab_number']); ?></td>
                                <td><?php echo htmlspecialchars($dev['os']); ?></td>
                                <td>
                                    <span class="status-badge status-<?php echo strtolower($dev['status']); ?>">
                                        <?php echo htmlspecialchars($dev['status']); ?>
                                    </span>
                                </td>
                                <td><?php echo date('M j, g:i a', strtotime($dev['last_seen'])); ?></td>
                                <td>
                                    <button class="btn btn-secondary" style="padding: 5px 10px; font-size: 12px;" 
                                        onclick="openEditModal(<?php echo $dev['id']; ?>, '<?php echo htmlspecialchars($dev['name']); ?>', '<?php echo htmlspecialchars($dev['lab_number']); ?>')">
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

<!-- Edit Modal -->
<div id="editModal" class="modal">
    <div class="modal-content">
        <h3 style="margin-top: 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Edit Device</h3>
        <p id="edit-hostname" style="color: #64748b; font-size: 14px; margin-bottom: 20px;"></p>
        
        <form method="POST">
            <input type="hidden" name="device_id" id="edit-device-id">
            
            <div class="form-group">
                <label class="form-label">Lab Number / Designation</label>
                <input type="text" name="lab_number" id="edit-lab-number" class="form-control" placeholder="e.g. Lab 1, Server Room" required>
            </div>
            
            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button type="submit" name="update_device" class="btn btn-primary" style="flex: 1;">Save Changes</button>
                <button type="button" onclick="closeEditModal()" class="btn btn-secondary">Cancel</button>
            </div>
        </form>
    </div>
</div>

<?php include 'components/footer.php'; ?>

<script>
function openEditModal(id, hostname, labNumber) {
    document.getElementById('edit-device-id').value = id;
    document.getElementById('edit-hostname').textContent = "Editing: " + hostname;
    document.getElementById('edit-lab-number').value = labNumber;
    document.getElementById('editModal').style.display = 'flex';
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

window.onclick = function(event) {
    var modal = document.getElementById('editModal');
    if (event.target == modal) {
        closeEditModal();
    }
}
</script>

</body>
</html>
