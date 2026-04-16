<?php
session_start();
include "db.php";

if(isset($_POST['login'])){
    $username = trim($_POST['username']);
    $password = trim($_POST['password']);
    
    // Check database for admin credentials
    $stmt = mysqli_prepare($conn, "SELECT password, role FROM admin_users WHERE username = ?");
    
    if($stmt === false) {
        $error = "Database error: " . mysqli_error($conn) . ". Please check if the admin_users table exists.";
    } else {
        mysqli_stmt_bind_param($stmt, "s", $username);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        
        if($row = mysqli_fetch_assoc($result)) {
            if($row['password'] === $password) {
                $_SESSION['admin'] = $username;
                $_SESSION['role'] = $row['role']; // e.g. 'admin' or 'assistant'
                header("Location: admin-dashboard.php");
                exit();
            } else {
                $error = "Invalid username or password";
            }
        } else {
            $error = "Invalid username or password";
        }
        mysqli_stmt_close($stmt);
    }
}

// If already logged in, redirect to dashboard
if(isset($_SESSION['admin'])){
    header("Location: admin-dashboard.php");
    exit();
}
?>
<!DOCTYPE html>
<html>
<head>
<title>Admin Login | LabTrack</title>
<link rel="stylesheet" href="css/clean-style.css">
</head>
<body>

<?php include 'components/header.php'; ?>

<div class="main-content">

<div class="card" style="max-width: 400px; margin: 60px auto;">
<div class="card-header">
    <h2 class="card-title">Admin Login</h2>
    <p class="card-subtitle">Access administrative dashboard</p>
</div>

<?php if(isset($error)): ?>
<div class="alert alert-error">
    <?php echo $error; ?>
</div>
<?php endif; ?>

<div class="alert alert-info">
    <strong>Demo Credentials:</strong><br>
    Admin: admin / admin123<br>
    Assistant: assistant / assistant123
</div>

<form method="POST">
    <div class="form-group">
        <label class="form-label">Username *</label>
        <input type="text" name="username" class="form-control" placeholder="Enter admin username" required>
    </div>
    
    <div class="form-group">
        <label class="form-label">Password *</label>
        <input type="password" name="password" class="form-control" placeholder="Enter admin password" required>
    </div>
    
    <button type="submit" name="login" class="btn btn-primary" style="width: 100%;">Login</button>
</form>

<div style="margin-top: 20px; text-align: center;">
    <a href="index.php" class="btn btn-secondary">Back to Home</a>
</div>

</div>

</div>

<?php include 'components/footer.php'; ?>

</body>
</html>
