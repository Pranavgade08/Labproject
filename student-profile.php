<?php
session_start();
include "db.php";

// Check if student is logged in
if (!isset($_SESSION['student'])) {
    header("Location: login.php");
    exit();
}

$prn = $_SESSION['student'];
$message = '';
$message_type = '';

// Fetch student details
$stmt = mysqli_prepare($conn, "SELECT name, prn, class, rollno, year FROM students WHERE prn = ?");
mysqli_stmt_bind_param($stmt, "s", $prn);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$student = mysqli_fetch_assoc($result);
mysqli_stmt_close($stmt);

if (isset($_POST['change_password'])) {
    $current_password = $_POST['current_password'];
    $new_password = $_POST['new_password'];
    $confirm_password = $_POST['confirm_password'];

    // Verify current password (using plain string comparison as the existing system doesn't use hashes)
    $stmt_check = mysqli_prepare($conn, "SELECT password FROM students WHERE prn = ?");
    mysqli_stmt_bind_param($stmt_check, "s", $prn);
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
        $stmt_update = mysqli_prepare($conn, "UPDATE students SET password = ? WHERE prn = ?");
        mysqli_stmt_bind_param($stmt_update, "ss", $new_password, $prn);
        if (mysqli_stmt_execute($stmt_update)) {
            $message = "Password updated successfully.";
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
    <title>Student Profile | LabTrack</title>
    <link rel="stylesheet" href="css/clean-style.css">
    <style>
        .profile-card {
            background: #fff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
            margin-bottom: 30px;
        }
        .profile-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
        }
        .info-group {
            background: #f8fafc;
            padding: 15px;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
        }
        .info-group label {
            display: block;
            color: #64748b;
            font-size: 13px;
            margin-bottom: 5px;
            font-weight: 500;
        }
        .info-group .value {
            color: #1e293b;
            font-size: 16px;
            font-weight: 600;
        }
        @media (max-width: 600px) {
            .profile-info {
                grid-template-columns: 1fr;
            }
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

        <h2>My Profile</h2>
        
        <div class="profile-card">
            <h3 style="margin-top: 0; margin-bottom: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Personal Details</h3>
            <div class="profile-info">
                <div class="info-group">
                    <label>Full Name</label>
                    <div class="value"><?php echo htmlspecialchars($student['name']); ?></div>
                </div>
                <div class="info-group">
                    <label>PRN / Student ID</label>
                    <div class="value"><?php echo htmlspecialchars($student['prn']); ?></div>
                </div>
                <div class="info-group">
                    <label>Class</label>
                    <div class="value"><?php echo htmlspecialchars($student['class']); ?></div>
                </div>
                <div class="info-group">
                    <label>Roll Number</label>
                    <div class="value"><?php echo htmlspecialchars($student['rollno']); ?></div>
                </div>
                <div class="info-group">
                    <label>Year</label>
                    <div class="value"><?php echo htmlspecialchars($student['year']); ?></div>
                </div>
            </div>
        </div>

        <div class="profile-card">
            <h3 style="margin-top: 0; margin-bottom: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Security: Change Password</h3>
            <form method="POST">
                <div class="form-group">
                    <label class="form-label">Current Password</label>
                    <input type="password" name="current_password" class="form-control" required>
                </div>
                <div class="form-group">
                    <label class="form-label">New Password</label>
                    <input type="password" name="new_password" class="form-control" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Confirm New Password</label>
                    <input type="password" name="confirm_password" class="form-control" required>
                </div>
                <button type="submit" name="change_password" class="btn btn-primary">Update Password</button>
            </form>
        </div>
    </div>
</div>

<?php include 'components/footer.php'; ?>
</body>
</html>
