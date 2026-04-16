<?php
session_start();
include "db.php";

if(!isset($_SESSION['student'])){
    header("Location: login.php");
    exit();
}

$prn = $_SESSION['student'];

$stmt = mysqli_prepare($conn, "SELECT i.*, s.name as student_name, s.class, s.rollno FROM issues i JOIN students s ON i.prn = s.prn WHERE i.prn = ? ORDER BY i.id DESC");
mysqli_stmt_bind_param($stmt, "s", $prn);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

if($result) {
    $issue_count = mysqli_num_rows($result);
} else {
    $issue_count = 0;
    $db_error = "Database query failed. Please try again.";
}
?>
<!DOCTYPE html>
<html>
<head>
<title>Student Dashboard | LabTrack</title>
<link rel="stylesheet" href="css/clean-style.css">
</head>
<body>

<?php include 'components/header.php'; ?>

<div class="main-content">

<div class="card">
<div class="card-header">
    <h2 class="card-title">My Submitted Issues</h2>
    <p class="card-subtitle">You have submitted <?php echo $issue_count; ?> issue(s)</p>
</div>

<?php if(isset($db_error)): ?>
<div class="alert alert-error">
    <?php echo $db_error; ?>
</div>
<?php elseif($issue_count > 0): ?>
<div class="table-responsive">
<table width="100%" class="modern-table">
<thead>
<tr>
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
        <button onclick="window.location.href='student-issue.php?edit=<?php echo $row['id']; ?>'" class="btn btn-secondary" style="padding: 5px 10px; font-size: 12px;">Update</button>
    </td>
</tr>
<?php } ?>
</tbody>
</table>
</div>

<div style="margin-top: 25px; text-align: center;">
    <button onclick="window.print()" class="btn btn-primary">🖨️ Download Report</button>
    <a href="student-issue.php" class="btn btn-success" style="margin-left: 15px;">➕ New Issue</a>
</div>
<?php else: ?>
<div class="alert alert-info" style="text-align: center; padding: 40px;">
    <h3 style="margin-bottom: 15px;">No Issues Submitted Yet</h3>
    <p style="margin-bottom: 20px;">You haven't reported any lab issues yet.</p>
    <a href="student-issue.php" class="btn btn-primary">Report Your First Issue</a>
</div>
<?php endif; ?>

</div>

</div>

<?php include 'components/footer.php'; ?>

<style>
/* Ensure proper table display */
.card {
    background: rgba(255, 255, 255, 0.95) !important;
    backdrop-filter: blur(20px) !important;
    border-radius: 16px !important;
    padding: 35px !important;
    box-shadow: 0 15px 35px rgba(21, 101, 192, 0.2) !important;
    border: 1px solid rgba(144, 202, 249, 0.5) !important;
    color: #1565c0 !important;
    margin: 20px 0 !important;
}

.table-responsive {
    overflow-x: auto !important;
    border-radius: 12px !important;
    box-shadow: 0 4px 12px rgba(21, 101, 192, 0.15) !important;
    background: rgba(255, 255, 255, 0.9) !important;
    padding: 10px !important;
}

.modern-table {
    width: 100% !important;
    border-collapse: collapse !important;
    background: rgba(255, 255, 255, 0.9) !important;
    border-radius: 12px !important;
    overflow: hidden !important;
    min-width: 1200px !important;
}

.modern-table th,
.modern-table td {
    padding: 1rem !important;
    text-align: left !important;
    border-bottom: 1px solid rgba(144, 202, 249, 0.5) !important;
    vertical-align: top !important;
}

.modern-table th {
    background: rgba(33, 150, 243, 0.2) !important;
    color: #1565c0 !important;
    font-weight: 600 !important;
    font-size: 14px !important;
    text-transform: uppercase !important;
    letter-spacing: 0.5px !important;
    white-space: nowrap !important;
}

.modern-table tr:hover {
    background: rgba(227, 242, 253, 0.5) !important;
}

.modern-table td {
    color: #1976d2 !important;
    font-size: 14px !important;
}

/* Only keep print-specific styles */
@media print {
    body * {
        visibility: hidden;
    }
    .card, .card * {
        visibility: visible;
    }
    .card {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
    }
    .btn, a, .status-badge {
        display: none;
    }
}
</style>

</body>
</html>
