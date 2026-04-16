# LabTrack - Smart Lab Reporting System

## 🚀 Quick Setup Instructions

### Database Setup Options:

**Option 1: Run Initialization Script (Recommended)**
1. Start XAMPP and ensure Apache and MySQL are running
2. Visit: `http://localhost/labproject/init_database.php`
3. The script will automatically create the database and tables

**Option 2: Import SQL File**
1. Open phpMyAdmin (`http://localhost/phpmyadmin`)
2. Click "New" to create a database named `labproject`
3. Select the `labproject` database
4. Click "Import" tab
5. Choose `labproject_database.sql` file from this folder
6. Click "Go" to import

**Option 3: Manual MySQL Commands**
```sql
CREATE DATABASE labproject;
USE labproject;

-- Then run the commands from labproject_database.sql
```

### Testing the Application:
- **Student Login**: Use any sample PRN (PRN001, PRN002, PRN003) with password: `password123`
- **Admin Login**: Username: `admin`, Password: `admin123`

### File Structure:
```
labproject/
├── components/          # Reusable UI components
│   ├── header.php      # Navigation header
│   └── footer.php      # Page footer
├── uploads/            # Photo uploads storage
├── css/
│   └── style.css       # Main stylesheet
├── init_database.php   # Database setup script
├── labproject_database.sql  # SQL import file
├── index.php           # Home page
├── login.php           # Student login
├── signup.php          # Student registration
├── student-dashboard.php  # Student issue dashboard
├── student-issue.php   # Report new issue
├── admin-login.php     # Admin login
├── admin-dashboard.php # Admin management
└── db.php             # Database connection
```

### Features:
✅ Photo upload for issue reporting
✅ Admin dashboard with status management
✅ Modern responsive UI design
✅ Issue tracking and status updates
✅ Professional styling with glass-morphism effects
✅ Mobile-friendly responsive design

### Troubleshooting:
- If database connection fails, check MySQL is running on port 3306
- Ensure XAMPP is properly installed and running
- Check file permissions for the uploads folder