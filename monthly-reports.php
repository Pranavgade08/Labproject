<?php
session_start();
include "db.php";

// Check if admin is logged in
if(!isset($_SESSION['admin'])) {
    header("Location: admin-login.php");
    exit();
}

// Get date range for report
$month = isset($_GET['month']) ? $_GET['month'] : date('Y-m');
$report_date = $month . '-01';
$start_date = date('Y-m-01', strtotime($report_date));
$end_date = date('Y-m-t', strtotime($report_date));

// Get report data
$issues_query = "SELECT 
    i.*,
    s.name as student_name,
    s.class,
    s.rollno,
    DATEDIFF(COALESCE(i.updated_at, NOW()), i.created_at) as total_days,
    CASE 
        WHEN i.status = 'Resolved' THEN DATEDIFF(i.updated_at, i.created_at)
        ELSE 0
    END as resolution_days
FROM issues i 
JOIN students s ON i.prn = s.prn 
WHERE DATE(i.created_at) >= '$start_date' AND DATE(i.created_at) <= '$end_date'
ORDER BY i.created_at DESC";

$issues_result = mysqli_query($conn, $issues_query);
$issues_count = mysqli_num_rows($issues_result);

// Get statistics
$pending_count = mysqli_num_rows(mysqli_query($conn, "SELECT * FROM issues WHERE status = 'Pending' AND DATE(created_at) >= '$start_date' AND DATE(created_at) <= '$end_date'"));
$resolved_count = mysqli_num_rows(mysqli_query($conn, "SELECT * FROM issues WHERE status = 'Resolved' AND DATE(created_at) >= '$start_date' AND DATE(created_at) <= '$end_date'"));
$in_progress_count = mysqli_num_rows(mysqli_query($conn, "SELECT * FROM issues WHERE status = 'In Progress' AND DATE(created_at) >= '$start_date' AND DATE(created_at) <= '$end_date'"));

// Get average resolution time
$resolution_query = mysqli_query($conn, "SELECT AVG(DATEDIFF(updated_at, created_at)) as avg_resolution FROM issues WHERE status = 'Resolved' AND DATE(created_at) >= '$start_date' AND DATE(created_at) <= '$end_date'");
$resolution_data = mysqli_fetch_assoc($resolution_query);
$avg_resolution_time = $resolution_data['avg_resolution'] ? round($resolution_data['avg_resolution'], 1) : 0;

// Get issues by lab
$lab_stats_query = mysqli_query($conn, "SELECT lab, COUNT(*) as count FROM issues WHERE DATE(created_at) >= '$start_date' AND DATE(created_at) <= '$end_date' GROUP BY lab ORDER BY count DESC");

// Get issues by type
$type_stats_query = mysqli_query($conn, "SELECT issue_type, COUNT(*) as count FROM issues WHERE DATE(created_at) >= '$start_date' AND DATE(created_at) <= '$end_date' GROUP BY issue_type ORDER BY count DESC");
?>
<!DOCTYPE html>
<html>
<head>
<title>Monthly Reports | LabTrack</title>
<link rel="stylesheet" href="css/clean-style.css">
</head>
<body>

<?php include 'components/header.php'; ?>

<div class="main-content">

<div class="card">
<div class="card-header">
    <h2 class="card-title">📊 Monthly Issue Report</h2>
    <p class="card-subtitle">Comprehensive analysis for <?php echo date('F Y', strtotime($report_date)); ?></p>
</div>

<!-- Report Controls -->
<div style="margin-bottom: 30px; padding: 20px; background: rgba(255,255,255,0.05); border-radius: 10px;">
    <form method="GET" style="display: flex; gap: 15px; align-items: center; flex-wrap: wrap;">
        <div>
            <label class="form-label" style="display: inline-block; margin-right: 10px;">Select Month:</label>
            <input type="month" name="month" value="<?php echo $month; ?>" class="form-control" style="width: auto; display: inline-block;">
        </div>
        <button type="submit" class="btn btn-primary">Generate Report</button>
        <button type="button" onclick="window.print()" class="btn btn-secondary">🖨️ Print Report</button>
    </form>
</div>

<!-- Summary Statistics -->
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px;">
    <div class="card" style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3);">
        <h3 style="color: #3b82f6; margin-bottom: 10px;">Total Issues</h3>
        <div style="font-size: 28px; font-weight: 700; color: #3b82f6;"><?php echo $issues_count; ?></div>
    </div>
    
    <div class="card" style="background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.3);">
        <h3 style="color: #fbbf24; margin-bottom: 10px;">Pending</h3>
        <div style="font-size: 28px; font-weight: 700; color: #fbbf24;"><?php echo $pending_count; ?></div>
    </div>
    
    <div class="card" style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3);">
        <h3 style="color: #10b981; margin-bottom: 10px;">Resolved</h3>
        <div style="font-size: 28px; font-weight: 700; color: #10b981;"><?php echo $resolved_count; ?></div>
    </div>
    
    <div class="card" style="background: rgba(156, 163, 175, 0.1); border: 1px solid rgba(156, 163, 175, 0.3);">
        <h3 style="color: #9ca3af; margin-bottom: 10px;">Avg. Resolution</h3>
        <div style="font-size: 28px; font-weight: 700; color: #9ca3af;"><?php echo $avg_resolution_time; ?> days</div>
    </div>
</div>

<!-- Charts Section -->
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
    <!-- Issues by Lab -->
    <div class="card">
        <h3 style="margin-bottom: 20px; color: #06b6d4;">Issues by Lab</h3>
        <div style="max-height: 300px; overflow-y: auto;">
            <?php while($lab_stat = mysqli_fetch_assoc($lab_stats_query)): ?>
                <div style="margin-bottom: 15px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <strong><?php echo htmlspecialchars($lab_stat['lab']); ?></strong>
                        <span><?php echo $lab_stat['count']; ?> issues</span>
                    </div>
                    <div style="background: rgba(255,255,255,0.1); border-radius: 5px; height: 8px;">
                        <div style="background: #06b6d4; height: 100%; width: <?php echo ($lab_stat['count'] / max(1, $issues_count)) * 100; ?>%; border-radius: 5px;"></div>
                    </div>
                </div>
            <?php endwhile; ?>
        </div>
    </div>
    
    <!-- Issues by Type -->
    <div class="card">
        <h3 style="margin-bottom: 20px; color: #06b6d4;">Issues by Type</h3>
        <div style="max-height: 300px; overflow-y: auto;">
            <?php while($type_stat = mysqli_fetch_assoc($type_stats_query)): ?>
                <div style="margin-bottom: 15px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <strong><?php echo htmlspecialchars($type_stat['issue_type']); ?></strong>
                        <span><?php echo $type_stat['count']; ?> issues</span>
                    </div>
                    <div style="background: rgba(255,255,255,0.1); border-radius: 5px; height: 8px;">
                        <div style="background: #8b5cf6; height: 100%; width: <?php echo ($type_stat['count'] / max(1, $issues_count)) * 100; ?>%; border-radius: 5px;"></div>
                    </div>
                </div>
            <?php endwhile; ?>
        </div>
    </div>
</div>

<!-- Detailed Issues List -->
<div class="card">
    <h3 style="margin-bottom: 20px; color: #06b6d4;">Detailed Issue List</h3>
    
    <?php if($issues_count > 0): ?>
    <div class="table-responsive">
        <table width="100%" class="modern-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Student</th>
                    <th>Lab</th>
                    <th>System</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Days</th>
                    <th>Resolution</th>
                </tr>
            </thead>
            <tbody>
                <?php while($row = mysqli_fetch_assoc($issues_result)): ?>
                <tr>
                    <td>#<?php echo $row['id']; ?></td>
                    <td><?php echo htmlspecialchars($row['student_name']); ?><br><small style="color: #94a3b8;"><?php echo htmlspecialchars($row['prn']); ?></small></td>
                    <td><?php echo htmlspecialchars($row['lab']); ?></td>
                    <td><?php echo $row['system_number'] ? htmlspecialchars($row['system_number']) : '-'; ?></td>
                    <td><?php echo htmlspecialchars($row['issue_type']); ?></td>
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
                    <td><?php echo date('M j', strtotime($row['created_at'])); ?></td>
                    <td><?php echo $row['total_days']; ?> days</td>
                    <td><?php echo $row['status'] == 'Resolved' ? $row['resolution_days'] . ' days' : '-'; ?></td>
                </tr>
                <?php endwhile; ?>
            </tbody>
        </table>
    </div>
    <?php else: ?>
    <div class="alert alert-info" style="text-align: center; padding: 40px;">
        <h3>No issues reported in <?php echo date('F Y', strtotime($report_date)); ?></h3>
    </div>
    <?php endif; ?>
</div>

</div>

</div>

<?php include 'components/footer.php'; ?>

<style>
@media print {
    .header, .footer, form, button {
        display: none !important;
    }
    
    body {
        background: white !important;
        color: black !important;
    }
    
    .card {
        box-shadow: none !important;
        border: 1px solid #ddd !important;
        background: white !important;
    }
    
    .status-badge {
        border: 1px solid #000 !important;
        color: #000 !important;
        background: transparent !important;
    }
    
    .table-responsive {
        overflow: visible !important;
    }
}
</style>

</body>
</html>
