<?php
// Database Initialization Script
// Run this script to set up the labproject database

echo "<h2>LabTrack Database Initialization</h2>";

$servername = "localhost";
$username = "root";
$password = "";
$database = "labproject";

// Create connection
$conn = new mysqli($servername, $username, $password);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

echo "Connected successfully to MySQL<br><br>";

// Create database
$sql = "CREATE DATABASE IF NOT EXISTS $database";
if ($conn->query($sql) === TRUE) {
    echo "Database '$database' created successfully or already exists<br>";
} else {
    echo "Error creating database: " . $conn->error . "<br>";
}

// Select database
$conn->select_db($database);

// Create students table
$students_table = "CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    prn VARCHAR(20) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    class VARCHAR(50),
    rollno VARCHAR(20),
    year VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";

if ($conn->query($students_table) === TRUE) {
    echo "Students table created successfully<br>";
} else {
    echo "Error creating students table: " . $conn->error . "<br>";
}

// Create admin_users table
$admin_table = "CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";

if ($conn->query($admin_table) === TRUE) {
    echo "Admin users table created successfully<br>";
} else {
    echo "Error creating admin users table: " . $conn->error . "<br>";
}

// Create issues table
$issues_table = "CREATE TABLE IF NOT EXISTS issues (
    id INT AUTO_INCREMENT PRIMARY KEY,
    prn VARCHAR(20) NOT NULL,
    lab VARCHAR(50) NOT NULL,
    issue_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    photo_path VARCHAR(255) NULL,
    system_number VARCHAR(20) NULL,
    hardware_photo_path VARCHAR(255) NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    admin_notes TEXT NULL,
    days_pending INT DEFAULT 0,
    days_completed INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (prn) REFERENCES students(prn) ON DELETE CASCADE
)";

if ($conn->query($issues_table) === TRUE) {
    echo "Issues table created successfully<br>";
} else {
    echo "Error creating issues table: " . $conn->error . "<br>";
}

// Insert sample data
$sample_student = "INSERT IGNORE INTO students (name, prn, password, class, rollno, year) VALUES 
('John Doe', 'PRN001', 'password123', 'B.Sc IT', '01', 'Second Year'),
('Jane Smith', 'PRN002', 'password123', 'BCA', '02', 'First Year'),
('Mike Johnson', 'PRN003', 'password123', 'B.Sc CS', '03', 'Third Year')";

if ($conn->query($sample_student) === TRUE) {
    echo "Sample student data inserted<br>";
} else {
    echo "Error inserting sample data: " . $conn->error . "<br>";
}

// Insert default admin data
$sample_admin = "INSERT IGNORE INTO admin_users (username, password) VALUES ('admin', 'admin123')";

if ($conn->query($sample_admin) === TRUE) {
    echo "Default admin data inserted<br>";
} else {
    echo "Error inserting default admin data: " . $conn->error . "<br>";
}

// Show database structure
echo "<br><h3>Database Structure:</h3>";
$tables = $conn->query("SHOW TABLES");
while($table = $tables->fetch_row()) {
    echo "<strong>Table: " . $table[0] . "</strong><br>";
    $columns = $conn->query("DESCRIBE " . $table[0]);
    echo "<ul>";
    while($column = $columns->fetch_assoc()) {
        echo "<li>" . $column['Field'] . " (" . $column['Type'] . ")</li>";
    }
    echo "</ul>";
}

$conn->close();

echo "<br><strong>Database initialization complete!</strong><br>";
echo "<a href='index.php'>Go to LabTrack Home</a>";
?>
