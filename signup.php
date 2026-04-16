<?php
include "db.php";

if(isset($_POST['signup'])){

    $name = trim($_POST['name']);
    $prn = trim($_POST['prn']);
    $password = trim($_POST['password']);
    $class = $_POST['class'];
    $rollno = $_POST['rollno'];
    $year = $_POST['year'];

    $check = mysqli_query($conn, "SELECT * FROM students WHERE prn='$prn'");
    if(mysqli_num_rows($check) > 0){
        $error = "PRN already registered";
    } else {
        $stmt = mysqli_prepare($conn, "INSERT INTO students (name, prn, password, class, rollno, year) VALUES (?, ?, ?, ?, ?, ?)");
        if($stmt) {
            mysqli_stmt_bind_param($stmt, "ssssss", $name, $prn, $password, $class, $rollno, $year);
            
            if(mysqli_stmt_execute($stmt)) {
                $success = "Signup successful! Please login to continue.";
            } else {
                $error = "Signup failed. Please try again.";
            }
            mysqli_stmt_close($stmt);
        } else {
            $error = "Database error. Please try again.";
        }
    }
}
?>
<!DOCTYPE html>
<html>
<head>
<title>Student Signup | LabTrack</title>
<link rel="stylesheet" href="css/clean-style.css">
</head>
<body>

<?php include 'components/header.php'; ?>

<div class="main-content">

<div class="card" style="max-width: 500px; margin: 40px auto;">
<div class="card-header">
    <h2 class="card-title">Student Registration</h2>
    <p class="card-subtitle">Create your account to report lab issues</p>
</div>

<?php if(isset($error)): ?>
<div class="alert alert-error">
    <?php echo $error; ?>
</div>
<?php endif; ?>

<?php if(isset($success)): ?>
<div class="alert alert-success">
    <?php echo $success; ?>
</div>
<?php endif; ?>

<form method="POST">
    <div class="form-group">
        <label class="form-label">Full Name *</label>
        <input type="text" name="name" class="form-control" placeholder="Enter your full name" required>
    </div>
    
    <div class="form-group">
        <label class="form-label">PRN Number *</label>
        <input type="text" name="prn" class="form-control" placeholder="Enter your PRN" required>
    </div>
    
    <div class="form-group">
        <label class="form-label">Password *</label>
        <input type="password" name="password" class="form-control" placeholder="Create a password" required>
    </div>
    
    <div class="form-group">
        <label class="form-label">Class *</label>
        <select name="class" class="form-control" required>
            <option value="">Select your class</option>
            <option value="B.Sc IT">B.Sc IT</option>
            <option value="BCA">BCA</option>
            <option value="B.Sc CS">B.Sc CS</option>
            <option value="B.Tech">B.Tech</option>
            <option value="MCA">MCA</option>
        </select>
    </div>
    
    <div class="form-group">
        <label class="form-label">Roll Number *</label>
        <input type="text" name="rollno" class="form-control" placeholder="Enter your roll number" required>
    </div>
    
    <div class="form-group">
        <label class="form-label">Year *</label>
        <select name="year" class="form-control" required>
            <option value="">Select your year</option>
            <option value="First Year">First Year</option>
            <option value="Second Year">Second Year</option>
            <option value="Third Year">Third Year</option>
            <option value="Fourth Year">Fourth Year</option>
        </select>
    </div>
    
    <button type="submit" name="signup" class="btn btn-primary" style="width: 100%;">Create Account</button>
</form>

<div style="margin-top: 20px; text-align: center;">
    <p>Already have an account? <a href="login.php">Login here</a></p>
</div>

</div>

</div>

<?php include 'components/footer.php'; ?>

</body>
</html>
