<?php
session_start();
include "db.php";

// Check if admin is logged in
if(!isset($_SESSION['admin'])) {
    header("Location: admin-login.php");
    exit();
}

// Handle Export to CSV
if (isset($_POST['export_csv'])) {
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename=lab_issues_export_' . date('Y-m-d') . '.csv');
    $output = fopen('php://output', 'w');
    fputcsv($output, array('ID', 'Student Name', 'PRN', 'Class', 'Roll No', 'Lab', 'System Number', 'Issue Type', 'Description', 'Status', 'Days Pending/Completed', 'Created At', 'Admin Notes'));

    $export_query = "SELECT i.*, s.name as student_name, s.class, s.rollno FROM issues i JOIN students s ON i.prn = s.prn ORDER BY i.created_at DESC";
    $export_result = mysqli_query($conn, $export_query);
    while ($row = mysqli_fetch_assoc($export_result)) {
        $days = $row['status'] == 'Resolved' ? $row['days_completed'] : $row['days_pending'];
        fputcsv($output, array(
            $row['id'], $row['student_name'], $row['prn'], $row['class'], $row['rollno'],
            $row['lab'], $row['system_number'], $row['issue_type'], $row['description'],
            $row['status'] ?? 'Pending', $days, $row['created_at'], $row['admin_notes']
        ));
    }
    fclose($output);
    exit();
}

// Handle Bulk Actions
if (isset($_POST['apply_bulk_action']) && !empty($_POST['selected_issues'])) {
    $action = $_POST['bulk_action'];
    $selected_ids = array_map('intval', $_POST['selected_issues']);
    $ids_string = implode(',', $selected_ids);

    if ($action === 'resolve') {
        $bulk_stmt = mysqli_prepare($conn, "UPDATE issues SET status = 'Resolved', days_completed = DATEDIFF(NOW(), created_at), updated_at = NOW() WHERE id IN ($ids_string)");
        if (mysqli_stmt_execute($bulk_stmt)) {
            $success_message = count($selected_ids) . " issue(s) marked as Resolved.";
        }
    } elseif ($action === 'delete') {
        $bulk_stmt = mysqli_prepare($conn, "DELETE FROM issues WHERE id IN ($ids_string)");
        if (mysqli_stmt_execute($bulk_stmt)) {
            $success_message = count($selected_ids) . " issue(s) deleted successfully.";
        }
    }
}

// Handle issue status updates
if(isset($_POST['update_status'])) {
    $issue_id = $_POST['issue_id'];
    $status = $_POST['status'];
    $admin_notes = $_POST['admin_notes'];
    
    // Handle days tracking based on status
    if($status == 'Resolved') {
        // Set completed days when issue is resolved
        $stmt = mysqli_prepare($conn, "UPDATE issues SET status = ?, admin_notes = ?, days_completed = DATEDIFF(NOW(), created_at), updated_at = NOW() WHERE id = ?");
    } else {
        // Update pending days for other statuses
        $stmt = mysqli_prepare($conn, "UPDATE issues SET status = ?, admin_notes = ?, days_pending = DATEDIFF(NOW(), created_at), updated_at = NOW() WHERE id = ?");
    }
    
    mysqli_stmt_bind_param($stmt, "ssi", $status, $admin_notes, $issue_id);
    
    if(mysqli_stmt_execute($stmt)) {
        $success_message = "Issue status updated successfully!";
    } else {
        $error_message = "Failed to update issue status.";
    }
    mysqli_stmt_close($stmt);
}

// Handle marking all notifications as read
if (isset($_POST['mark_notif_read'])) {
    mysqli_query($conn, "UPDATE notifications SET is_read = 1 WHERE is_read = 0");
    $success_message = "All notifications marked as read.";
}

// Get all issues with student details and apply filters
$status_filter = isset($_GET['filter_status']) ? $_GET['filter_status'] : 'All';
$where_clause = "";
if ($status_filter !== 'All') {
    if ($status_filter === 'Pending') {
        $where_clause = " WHERE (i.status = 'Pending' OR i.status IS NULL) ";
    } else {
        $where_clause = " WHERE i.status = '" . mysqli_real_escape_string($conn, $status_filter) . "' ";
    }
}

$query = "SELECT i.*, s.name as student_name, s.class, s.rollno 
          FROM issues i 
          JOIN students s ON i.prn = s.prn 
          $where_clause
          ORDER BY i.created_at DESC";
$result = mysqli_query($conn, $query);
$issue_count = mysqli_num_rows($result);

// Get issue statistics
$pending_count = mysqli_num_rows(mysqli_query($conn, "SELECT * FROM issues WHERE status = 'Pending' OR status IS NULL"));
$in_progress_count = mysqli_num_rows(mysqli_query($conn, "SELECT * FROM issues WHERE status = 'In Progress'"));
$resolved_count = mysqli_num_rows(mysqli_query($conn, "SELECT * FROM issues WHERE status = 'Resolved'"));

// Get PC statistics
$online_pcs = mysqli_num_rows(mysqli_query($conn, "SELECT id FROM computers WHERE status = 'Online'"));
$offline_pcs = mysqli_num_rows(mysqli_query($conn, "SELECT id FROM computers WHERE status = 'Offline'"));
$total_pcs = $online_pcs + $offline_pcs;

// Get recent user session activity (last 24 hours)
$active_sessions = mysqli_num_rows(mysqli_query($conn, "SELECT id FROM user_sessions WHERE login_time >= NOW() - INTERVAL 24 HOUR"));

// Get unread notifications
$notifications_result = mysqli_query($conn, "SELECT * FROM notifications WHERE is_read = 0 ORDER BY created_at DESC LIMIT 5");
$unread_notif_count = mysqli_num_rows($notifications_result);
mysqli_data_seek($notifications_result, 0); // Reset pointer
?>
<!DOCTYPE html>
<html>
<head>
<title>Admin Dashboard | LabTrack</title>
<link rel="stylesheet" href="css/clean-style.css">
</head>
<body>

<?php include 'components/header.php'; ?>

<div class="main-content">

<div class="card">
<div class="card-header">
    <h2 class="card-title">Admin Dashboard</h2>
    <p class="card-subtitle">Manage and track all lab issues</p>
</div>

<?php if(isset($success_message)): ?>
<div class="alert alert-success">
    <?php echo $success_message; ?>
</div>
<?php endif; ?>

<?php if(isset($error_message)): ?>
<div class="alert alert-error">
    <?php echo $error_message; ?>
</div>
<?php endif; ?>

<!-- Statistics Cards -->
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px; margin-bottom: 30px;">
    <div class="card" style="background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.3);">
        <h3 style="color: #fbbf24; margin-bottom: 5px;">⚠️ Pending</h3>
        <div style="font-size: 28px; font-weight: 700; color: #fbbf24;"><?php echo $pending_count; ?></div>
        <small style="color: #b45309;">Issues</small>
    </div>
    
    <div class="card" style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3);">
        <h3 style="color: #3b82f6; margin-bottom: 5px;">🔧 In Progress</h3>
        <div style="font-size: 28px; font-weight: 700; color: #3b82f6;"><?php echo $in_progress_count; ?></div>
        <small style="color: #1d4ed8;">Issues</small>
    </div>
    
    <div class="card" style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3);">
        <h3 style="color: #10b981; margin-bottom: 5px;">✅ Resolved</h3>
        <div style="font-size: 28px; font-weight: 700; color: #10b981;"><?php echo $resolved_count; ?></div>
        <small style="color: #065f46;">Issues</small>
    </div>
    
    <div class="card" style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3);">
        <h3 style="color: #10b981; margin-bottom: 5px;">🖥️ Online PCs</h3>
        <div style="font-size: 28px; font-weight: 700; color: #10b981;"><?php echo $online_pcs; ?></div>
        <small style="color: #065f46;">of <?php echo $total_pcs; ?> total</small>
    </div>
    
    <div class="card" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3);">
        <h3 style="color: #ef4444; margin-bottom: 5px;">💤 Offline PCs</h3>
        <div style="font-size: 28px; font-weight: 700; color: #ef4444;"><?php echo $offline_pcs; ?></div>
        <small style="color: #991b1b;">of <?php echo $total_pcs; ?> total</small>
    </div>
    
    <div class="card" style="background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3);">
        <h3 style="color: #8b5cf6; margin-bottom: 5px;">👨‍💻 Sessions</h3>
        <div style="font-size: 28px; font-weight: 700; color: #8b5cf6;"><?php echo $active_sessions; ?></div>
        <small style="color: #5b21b6;">Last 24 hours</small>
    </div>
</div>

<?php if ($unread_notif_count > 0): ?>
<div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
    <h4 style="margin: 0 0 10px 0; color: #1e40af;">🔔 Notifications (<?php echo $unread_notif_count; ?> unread)</h4>
    <?php while ($notif = mysqli_fetch_assoc($notifications_result)): ?>
    <div style="padding: 5px 0; border-bottom: 1px solid #bfdbfe; font-size: 13px; color: #1e3a8a;">
        <strong><?php echo htmlspecialchars($notif['title']); ?></strong>: <?php echo htmlspecialchars($notif['message']); ?>
        <span style="color: #93c5fd; margin-left: 10px; font-size: 11px;"><?php echo date('M j, g:i a', strtotime($notif['created_at'])); ?></span>
    </div>
    <?php endwhile; ?>
    <form method="POST" style="margin-top: 10px;">
        <button type="submit" name="mark_notif_read" class="btn btn-secondary" style="padding: 5px 12px; font-size: 12px;">Mark all read</button>
    </form>
</div>
<?php endif; ?>

<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
    <!-- Export Button -->
    <form method="POST" style="margin: 0;">
        <button type="submit" name="export_csv" class="btn btn-secondary" style="background: #10b981; color: white; border: none; padding: 10px 20px;">📥 Export to CSV</button>
    </form>
    
    <!-- Filter -->
    <form method="GET" style="margin: 0; display: flex; gap: 10px; align-items: center;">
        <label for="filter_status" style="font-weight: 500; color: #475569;">Filter Status:</label>
        <select name="filter_status" id="filter_status" class="form-control" style="width: auto; padding: 8px;" onchange="this.form.submit()">
            <option value="All" <?php echo $status_filter == 'All' ? 'selected' : ''; ?>>All Issues</option>
            <option value="Pending" <?php echo $status_filter == 'Pending' ? 'selected' : ''; ?>>Pending</option>
            <option value="In Progress" <?php echo $status_filter == 'In Progress' ? 'selected' : ''; ?>>In Progress</option>
            <option value="Resolved" <?php echo $status_filter == 'Resolved' ? 'selected' : ''; ?>>Resolved</option>
        </select>
    </form>
</div>

<?php if($issue_count > 0 || $status_filter !== 'All'): ?>
<div class="table-responsive">
<form method="POST" onsubmit="return confirm('Are you sure you want to apply this bulk action?');">
<table width="100%" class="modern-table">
<thead>
<tr>
    <th style="width: 40px; text-align: center;"><input type="checkbox" id="selectAll" onclick="toggleSelectAll()"></th>
    <th>ID</th>
    <th>Student</th>
    <th>Class/Roll</th>
    <th>Lab/System</th>
    <th>Type</th>
    <th>Description</th>
    <th>Photos</th>
    <th>Status</th>
    <th>Days</th>
    <th>Date</th>
    <th>Actions</th>
</tr>
</thead>
<tbody>
<?php while($row = mysqli_fetch_assoc($result)) { ?>
<tr>
    <td style="text-align: center;"><input type="checkbox" name="selected_issues[]" value="<?php echo $row['id']; ?>" class="issue-checkbox"></td>
    <td>#<?php echo $row['id']; ?></td>
    <td><?php echo htmlspecialchars($row['student_name']); ?><br><small style="color: #94a3b8;"><?php echo htmlspecialchars($row['prn']); ?></small></td>
    <td><?php echo htmlspecialchars($row['class']); ?><br><small>Roll: <?php echo htmlspecialchars($row['rollno']); ?></small></td>
    <td>
        <?php echo htmlspecialchars($row['lab']); ?>
        <?php if($row['system_number']): ?>
            <br><span class="system-number">System: <?php echo htmlspecialchars($row['system_number']); ?></span>
        <?php endif; ?>
    </td>
    <td><?php echo htmlspecialchars($row['issue_type']); ?></td>
    <td><?php echo htmlspecialchars(substr($row['description'], 0, 50)); ?><?php echo strlen($row['description']) > 50 ? '...' : ''; ?></td>
    <td>
        <div style="display: flex; gap: 5px; flex-wrap: wrap;">
            <?php if($row['photo_path'] && file_exists($row['photo_path'])): ?>
                <a href="<?php echo $row['photo_path']; ?>" target="_blank" class="btn btn-secondary" style="padding: 3px 8px; font-size: 11px;">📸</a>
            <?php endif; ?>
            <?php if($row['hardware_photo_path'] && file_exists($row['hardware_photo_path'])): ?>
                <a href="<?php echo $row['hardware_photo_path']; ?>" target="_blank" class="btn btn-secondary" style="padding: 3px 8px; font-size: 11px;">🔧</a>
            <?php endif; ?>
            <?php if(!$row['photo_path'] && !$row['hardware_photo_path']): ?>
                <span style="color: #94a3b8; font-size: 12px;">No photos</span>
            <?php endif; ?>
        </div>
    </td>
    <td>
        <?php 
        $status = $row['status'] ?? 'Pending';
        $status_class = '';
        switch($status) {
            case 'Resolved': $status_class = 'status-resolved'; break;
            case 'In Progress': $status_class = 'status-progress'; break;
            default: $status_class = 'status-pending';
        }
        ?>
        <span class="status-badge <?php echo $status_class; ?>"><?php echo $status; ?></span>
    </td>
    <td>
        <?php 
        $days = $row['status'] == 'Resolved' ? $row['days_completed'] : $row['days_pending'];
        echo $days . ' day' . ($days != 1 ? 's' : '');
        ?>
    </td>
    <td><?php echo date('M j, Y', strtotime($row['created_at'])); ?></td>
    <td>
        <button onclick="openUpdateModal(<?php echo $row['id']; ?>, '<?php echo addslashes($row['status'] ?? 'Pending'); ?>', '<?php echo addslashes($row['admin_notes'] ?? ''); ?>')" class="btn btn-secondary" style="padding: 5px 10px; font-size: 12px;">Update</button>
    </td>
</tr>
<?php } ?>
</tbody>
</table>
<div style="margin-top: 15px; display: flex; gap: 10px; align-items: center; background: #f8fafc; padding: 10px; border-radius: 6px; border: 1px solid #e2e8f0;">
    <span style="font-weight: 500; color: #475569;">With Selected:</span>
    <select name="bulk_action" class="form-control" style="width: 200px; padding: 8px;" required>
        <option value="">Choose action...</option>
        <option value="resolve">Mark as Resolved</option>
        <option value="delete" style="color: #ef4444;">Delete Issues</option>
    </select>
    <button type="submit" name="apply_bulk_action" class="btn btn-primary" style="padding: 8px 16px;">Apply Plugin</button>
</div>
</form>
</div>
<?php else: ?>
<div class="alert alert-info" style="text-align: center; padding: 40px;">
    <h3 style="margin-bottom: 15px;">No Issues Reported Yet</h3>
    <p>No students have reported any lab issues at this time.</p>
</div>
<?php endif; ?>

</div>

</div>

<!-- Update Status Modal -->
<div id="updateModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 1000; align-items: center; justify-content: center;">
    <div class="card" style="max-width: 500px; margin: 20px;">
        <div class="card-header">
            <h2 class="card-title">Update Issue Status</h2>
        </div>
        <form method="POST" id="updateForm">
            <input type="hidden" name="issue_id" id="issue_id">
            <div class="form-group">
                <label class="form-label">Status</label>
                <select name="status" class="form-control" id="status_select" required>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Admin Notes</label>
                <textarea name="admin_notes" class="form-control" id="admin_notes" placeholder="Add notes about the resolution..." style="height: 100px;"></textarea>
            </div>
            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button type="submit" name="update_status" class="btn btn-primary">Update Status</button>
                <button type="button" onclick="closeUpdateModal()" class="btn btn-secondary">Cancel</button>
            </div>
        </form>
    </div>
</div>

<?php include 'components/footer.php'; ?>

<script>
function openUpdateModal(issueId, currentStatus, adminNotes) {
    document.getElementById('issue_id').value = issueId;
    document.getElementById('status_select').value = currentStatus;
    document.getElementById('admin_notes').value = adminNotes;
    document.getElementById('updateModal').style.display = 'flex';
}

function closeUpdateModal() {
    document.getElementById('updateModal').style.display = 'none';
}

// Close modal when clicking outside
document.getElementById('updateModal').addEventListener('click', function(e) {
    if(e.target === this) {
        closeUpdateModal();
    }
});

function toggleSelectAll() {
    var checkboxes = document.getElementsByClassName('issue-checkbox');
    var selectAll = document.getElementById('selectAll');
    for (var i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = selectAll.checked;
    }
}
</script>

</body>
</html>
