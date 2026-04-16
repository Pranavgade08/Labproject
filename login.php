<?php
session_start();
include "db.php";

if(isset($_POST['login'])){
    $prn = trim($_POST['prn']);
    $password = trim($_POST['password']);

    $stmt = mysqli_prepare($conn, "SELECT * FROM students WHERE prn = ?");
    mysqli_stmt_bind_param($stmt, "s", $prn);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    if($result && mysqli_num_rows($result)==1){
        $row = mysqli_fetch_assoc($result);
        if($row['password'] == $password){
            $_SESSION['student'] = $row['prn'];
            $_SESSION['name'] = $row['name'];
            
            // Track session: find computer ID by client IP if available
            $client_ip = $_SERVER['REMOTE_ADDR'];
            $comp_result = mysqli_query($conn, "SELECT id FROM computers WHERE ip_address = '" . mysqli_real_escape_string($conn, $client_ip) . "' LIMIT 1");
            $computer_id = null;
            if ($comp_row = mysqli_fetch_assoc($comp_result)) {
                $computer_id = $comp_row['id'];
            }
            
            // Insert login session record
            $sess_stmt = mysqli_prepare($conn, "INSERT INTO user_sessions (student_prn, computer_id, ip_address) VALUES (?, ?, ?)");
            mysqli_stmt_bind_param($sess_stmt, "sis", $row['prn'], $computer_id, $client_ip);
            mysqli_stmt_execute($sess_stmt);
            $_SESSION['session_db_id'] = mysqli_insert_id($conn); // Store for logout
            mysqli_stmt_close($sess_stmt);
            
            header("Location: student-dashboard.php");
            exit();
        } else {
            $error = "Wrong password";
        }
    } else {
        $error = "PRN not registered";
    }
}
?>
<!DOCTYPE html>
<html>
<head>
<title>Student Login | LabTrack</title>
<link rel="stylesheet" href="css/clean-style.css">
</head>
<body>

<?php include 'components/header.php'; ?>

<div class="main-content">

<div class="card" style="max-width: 400px; margin: 60px auto;">
<div class="card-header">
    <h2 class="card-title">Student Login</h2>
    <p class="card-subtitle">Access your lab issue dashboard</p>
</div>

<?php if(isset($error)): ?>
<div class="alert alert-error">
    <?php echo $error; ?>
</div>
<?php endif; ?>

<form method="POST">
    <div class="form-group">
        <label class="form-label">PRN Number *</label>
        <input type="text" name="prn" class="form-control" placeholder="Enter your PRN" required>
    </div>
    
    <div class="form-group">
        <label class="form-label">Password *</label>
        <input type="password" name="password" class="form-control" placeholder="Enter your password" required>
    </div>
    
    <button type="submit" name="login" class="btn btn-primary" style="width: 100%;">Login</button>
</form>

<div style="margin-top: 20px; text-align: center;">
    <p>New student? <a href="signup.php">Create an account</a></p>
</div>

</div>

</div>

<?php include 'components/footer.php'; ?>

</body>
</html>
