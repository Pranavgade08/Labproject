-- LabTrack Database Schema
-- Import this file into phpMyAdmin or MySQL command line

-- Create database
CREATE DATABASE IF NOT EXISTS labproject;
USE labproject;

-- Create students table
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    prn VARCHAR(20) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    class VARCHAR(50),
    rollno VARCHAR(20),
    year VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create issues table
CREATE TABLE IF NOT EXISTS issues (
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
);

-- Insert sample data
INSERT IGNORE INTO students (name, prn, password, class, rollno, year) VALUES 
('John Doe', 'PRN001', 'password123', 'B.Sc IT', '01', 'Second Year'),
('Jane Smith', 'PRN002', 'password123', 'BCA', '02', 'First Year'),
('Mike Johnson', 'PRN003', 'password123', 'B.Sc CS', '03', 'Third Year');

-- Insert default admin (if not exists)
INSERT IGNORE INTO admin_users (username, password) VALUES ('admin', 'admin123');

-- Verify tables created
SHOW TABLES;

-- Describe table structure
DESCRIBE students;
DESCRIBE issues;