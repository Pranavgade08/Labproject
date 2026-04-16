<?php
session_start();
include "db.php";

// Update logout time for student sessions
if (isset($_SESSION['session_db_id'])) {
    $session_db_id = (int)$_SESSION['session_db_id'];
    mysqli_query($conn, "UPDATE user_sessions SET logout_time = NOW() WHERE id = $session_db_id");
}

// Clear all session variables
session_unset();
// Destroy the session
session_destroy();
// Redirect to home page
header("Location: index.php");
exit();
?>
