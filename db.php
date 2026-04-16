<?php
$conn = mysqli_connect("localhost", "root", "", "labproject", 3306);

if(!$conn){
    // Try to create database if it doesn't exist
    $temp_conn = mysqli_connect("localhost", "root", "", "", 3306);
    if($temp_conn) {
        mysqli_query($temp_conn, "CREATE DATABASE IF NOT EXISTS labproject");
        mysqli_close($temp_conn);
        // Try connecting again
        $conn = mysqli_connect("localhost", "root", "", "labproject", 3306);
    }
}

if(!$conn){
    die("Database connection failed: " . mysqli_connect_error() . "<br>Please run the database initialization script.");
}

// Check if tables exist, if not create them
$table_check = mysqli_query($conn, "SHOW TABLES LIKE 'students'");
if(mysqli_num_rows($table_check) == 0) {
    // Create tables
    $create_tables = file_get_contents(__DIR__ . '/labproject_database.sql');
    $queries = explode(';', $create_tables);
    foreach($queries as $query) {
        $query = trim($query);
        if(!empty($query)) {
            mysqli_query($conn, $query);
        }
    }
}
?>
