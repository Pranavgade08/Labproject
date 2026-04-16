<?php
session_start();
include "db.php";

// Check if admin is logged in
if (!isset($_SESSION['admin']) || !isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    header("Location: admin-dashboard.php");
    exit();
}

$admin_username = $_SESSION['admin'];
$message = '';
$message_type = '';

if (isset($_POST['change_password'])) {
    $current_password = $_POST['current_password'];
    $new_password = $_POST['new_password'];
    $confirm_password = $_POST['confirm_password'];

    // Verify current password
    $stmt_check = mysqli_prepare($conn, "SELECT password FROM admin_users WHERE username = ?");
    mysqli_stmt_bind_param($stmt_check, "s", $admin_username);
    mysqli_stmt_execute($stmt_check);
    $res_check = mysqli_stmt_get_result($stmt_check);
    $row = mysqli_fetch_assoc($res_check);
    mysqli_stmt_close($stmt_check);

    if ($row['password'] !== $current_password) {
        $message = "Current password is incorrect.";
        $message_type = 'error';
    } elseif ($new_password !== $confirm_password) {
        $message = "New passwords do not match.";
        $message_type = 'error';
    } elseif (strlen($new_password) < 6) {
        $message = "New password must be at least 6 characters long.";
        $message_type = 'error';
    } else {
        // Update password
        $stmt_update = mysqli_prepare($conn, "UPDATE admin_users SET password = ? WHERE username = ?");
        mysqli_stmt_bind_param($stmt_update, "ss", $new_password, $admin_username);
        if (mysqli_stmt_execute($stmt_update)) {
            $message = "Admin password updated successfully.";
            $message_type = 'success';
        } else {
            $message = "Error updating password.";
            $message_type = 'error';
        }
        mysqli_stmt_close($stmt_update);
    }
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>Admin Settings | LabTrack</title>
    <link rel="stylesheet" href="css/clean-style.css">
    <style>
        .settings-card {
            background: #fff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
            max-width: 600px;
            margin: 0 auto;
        }
    </style>
</head>
<body>

<?php include 'components/header.php'; ?>

<div class="main-content">
    <div style="max-width: 800px; margin: 0 auto;">
        
        <?php if ($message): ?>
            <div class="alert alert-<?php echo $message_type; ?>">
                <?php echo $message; ?>
            </div>
        <?php endif; ?>

        <h2 style="text-align: center; margin-bottom: 30px;">Admin Settings</h2>
        
        <div class="settings-card">
            <h3 style="margin-top: 0; margin-bottom: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Change Admin Password</h3>
            <p style="color: #64748b; font-size: 14px; margin-bottom: 20px;">Use this form to update the master password for the admin dashboard.</p>
            <form method="POST">
                <div class="form-group">
                    <label class="form-label">Current Password</label>
                    <input type="password" name="current_password" class="form-control" placeholder="Enter current admin password" required>
                </div>
                <div class="form-group">
                    <label class="form-label">New Password</label>
                    <input type="password" name="new_password" class="form-control" placeholder="Minimum 6 characters" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Confirm New Password</label>
                    <input type="password" name="confirm_password" class="form-control" placeholder="Re-type new password" required>
                </div>
                <button type="submit" name="change_password" class="btn btn-primary" style="width: 100%;">Update Admin Password</button>
            </form>
        </div>
    </div>
</div>

<?php include 'components/footer.php'; ?>

</body>
</html>
