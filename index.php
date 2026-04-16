<?php session_start(); ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LabTrack – Smart Lab Reporting System</title>
    <link rel="stylesheet" href="css/clean-style.css">
</head>
<body>

<?php include 'components/header.php'; ?>

<?php
// Include database connection
include 'db.php';

// Fetch summary statistics
$total_reports = mysqli_num_rows(mysqli_query($conn, "SELECT * FROM issues"));
$pending_reports = mysqli_num_rows(mysqli_query($conn, "SELECT * FROM issues WHERE status = 'Pending' OR status IS NULL"));
$resolved_reports = mysqli_num_rows(mysqli_query($conn, "SELECT * FROM issues WHERE status = 'Resolved'"));

// Calculate average resolution time (in days)
$avg_resolution_query = mysqli_query($conn, "SELECT AVG(DATEDIFF(updated_at, created_at)) as avg_days FROM issues WHERE status = 'Resolved' AND updated_at IS NOT NULL");
$avg_resolution_result = mysqli_fetch_assoc($avg_resolution_query);
$avg_resolution = $avg_resolution_result['avg_days'] ? round($avg_resolution_result['avg_days'], 1) : 0;

// Get recent issues with photos
$recent_issues_query = mysqli_query($conn, "SELECT * FROM issues WHERE photo_path IS NOT NULL OR hardware_photo_path IS NOT NULL ORDER BY created_at DESC LIMIT 4");
$recent_issues = [];
while($row = mysqli_fetch_assoc($recent_issues_query)) {
    $recent_issues[] = $row;
}

// If no issues with photos, use default images with computer info
if(empty($recent_issues)) {
    // Create dummy data for display with computer info
    $recent_issues = [
        [
            'id' => 'dummy1',
            'description' => 'Monitor not displaying properly, black screen issue', 
            'photo_path' => 'images/img1.jpeg', 
            'lab' => 'Lab 1', 
            'system_number' => 'PC-01', 
            'issue_type' => 'Display',
            'status' => 'Resolved',
            'created_at' => date('Y-m-d H:i:s', strtotime('-2 days'))
        ],
        [
            'id' => 'dummy2',
            'description' => 'Keyboard keys not responding', 
            'photo_path' => 'images/img1.jpeg', 
            'lab' => 'Lab 2', 
            'system_number' => 'PC-15', 
            'issue_type' => 'Input Device',
            'status' => 'Pending',
            'created_at' => date('Y-m-d H:i:s', strtotime('-1 day'))
        ],
        [
            'id' => 'dummy3',
            'description' => 'Mouse cursor jumping around', 
            'photo_path' => 'images/img1.jpeg', 
            'lab' => 'Lab 3', 
            'system_number' => 'PC-08', 
            'issue_type' => 'Input Device',
            'status' => 'In Progress',
            'created_at' => date('Y-m-d H:i:s')
        ],
        [
            'id' => 'dummy4',
            'description' => 'Network connection intermittent', 
            'photo_path' => 'images/img1.jpeg', 
            'lab' => 'Lab 4', 
            'system_number' => 'PC-22', 
            'issue_type' => 'Network',
            'status' => 'Resolved',
            'created_at' => date('Y-m-d H:i:s', strtotime('-3 days'))
        ],
    ];
}

// If no issues with photos, use default images
if(empty($recent_issues)) {
    // Create dummy data for display with computer info
    $recent_issues = [
        [
            'description' => 'Monitor not displaying properly, black screen issue', 
            'photo_path' => 'images/img1.jpeg', 
            'lab' => 'Lab 1', 
            'system_number' => 'PC-01', 
            'issue_type' => 'Display',
            'status' => 'Resolved',
            'created_at' => date('Y-m-d H:i:s', strtotime('-2 days'))
        ],
        [
            'description' => 'Keyboard keys not responding', 
            'photo_path' => 'images/img1.jpeg', 
            'lab' => 'Lab 2', 
            'system_number' => 'PC-15', 
            'issue_type' => 'Input Device',
            'status' => 'Pending',
            'created_at' => date('Y-m-d H:i:s', strtotime('-1 day'))
        ],
        [
            'description' => 'Mouse cursor jumping around', 
            'photo_path' => 'images/img1.jpeg', 
            'lab' => 'Lab 3', 
            'system_number' => 'PC-08', 
            'issue_type' => 'Input Device',
            'status' => 'In Progress',
            'created_at' => date('Y-m-d H:i:s')
        ],
        [
            'description' => 'Network connection intermittent', 
            'photo_path' => 'images/img1.jpeg', 
            'lab' => 'Lab 4', 
            'system_number' => 'PC-22', 
            'issue_type' => 'Network',
            'status' => 'Resolved',
            'created_at' => date('Y-m-d H:i:s', strtotime('-3 days'))
        ],
    ];
}
?>

<div class="main-content">

<!-- HERO -->
<section class="hero">
    <div class="hero-content">
        <span class="badge">Smart College Solution</span>
        <h1>Modern Computer Lab Reporting System</h1>
        <p>
            Report lab issues instantly.  
            Track complaints transparently.  
            Manage resources efficiently.
        </p>

        <div class="hero-buttons">
            <a href="login.php" class="btn primary">Get Started</a>
            <a href="#features" class="btn outline">Explore</a>
            <button onclick="testModals()" class="btn secondary" style="background: #ff9800; color: white; border: none; padding: 12px 24px; border-radius: 25px; cursor: pointer; font-weight: 600; margin-left: 15px;">Test Modals</button>
        </div>
    </div>

    <div class="hero-visual">
        <div class="glass-card">
            <h3>Live System</h3>
            <p>✔ Student Reports</p>
            <p>✔ Admin Dashboard</p>
            <p>✔ Real-time Status</p>
        </div>
    </div>
</section>

<!-- RECENT ISSUE REPORTS -->
<div class="system-info-card">
    <h3 class="system-info-title">Recent Issue Reports</h3>
    <div class="image-gallery">
        <?php foreach($recent_issues as $issue): ?>
        <div class="gallery-item">
            <?php 
            // Determine which photo to show
            $photo_path = $issue['photo_path'] ?: ($issue['hardware_photo_path'] ?: 'images/img1.jpeg');
            
            // Create proper description
            $issue_desc = !empty($issue['description']) ? substr($issue['description'], 0, 50) : $issue['issue_type'];
            if(strlen($issue['description']) > 50) {
                $issue_desc .= '...';
            }
            
            // System info with computer details
            $system_info = '';
            if($issue['system_number']) {
                $system_info = 'System: ' . htmlspecialchars($issue['system_number']);
            } else {
                $system_info = htmlspecialchars($issue['lab']);
            }
            
            // Computer/Equipment info
            $computer_info = '';
            if($issue['system_number']) {
                $computer_info = 'Computer: ' . htmlspecialchars($issue['system_number']);
            } elseif($issue['issue_type']) {
                $computer_info = 'Equipment: ' . htmlspecialchars($issue['issue_type']);
            }
            
            // Status badge
            $status = $issue['status'] ?? 'Pending';
            $status_class = '';
            switch($status) {
                case 'Resolved': $status_class = 'status-resolved'; break;
                case 'In Progress': $status_class = 'status-progress'; break;
                default: $status_class = 'status-pending';
            }
            
            // Create a modal link for detailed view
            $modal_id = 'issue-modal-' . $issue['id'] ?? rand(1000, 9999);
            ?>
            <img src="<?php echo htmlspecialchars($photo_path); ?>" alt="Issue: <?php echo htmlspecialchars($issue_desc); ?>" class="gallery-image">
            <div class="gallery-content">
                <div class="gallery-header">
                    <h4 class="gallery-title"><?php echo htmlspecialchars($issue_desc); ?></h4>
                    <span class="status-badge <?php echo $status_class; ?>"><?php echo $status; ?></span>
                </div>
                <div class="gallery-details">
                    <p class="gallery-meta"><strong><?php echo $system_info; ?></strong></p>
                    <?php if($computer_info && $computer_info !== $system_info): ?>
                    <p class="gallery-computer"><?php echo $computer_info; ?></p>
                    <?php endif; ?>
                    <p class="gallery-date">Reported: <?php echo date('M j, Y', strtotime($issue['created_at'])); ?></p>
                </div>
                <div class="gallery-actions">
                    <div class="action-buttons">
                        <a href="javascript:void(0)" class="btn btn-secondary" onclick="createIssueModal('<?php echo $issue['id'] ?? 'unknown'; ?>', '<?php echo addslashes(htmlspecialchars($issue_desc)); ?>', '<?php echo addslashes(htmlspecialchars($system_info)); ?>', '<?php echo addslashes(htmlspecialchars($computer_info)); ?>', '<?php echo date('M j, Y g:i A', strtotime($issue['created_at'])); ?>', '<?php echo addslashes(htmlspecialchars($status)); ?>', '<?php echo htmlspecialchars($photo_path); ?>', '<?php echo addslashes(htmlspecialchars($issue['description'])); ?>'); return false;">👁️ View</a>
                        <a href="monthly-reports.php" class="btn btn-primary">📥 Download</a>
                    </div>
                </div>
            </div>
            
        </div>
        <?php endforeach; ?>
    </div>
    <div style="text-align: center; margin-top: 25px;">
        <a href="monthly-reports.php" class="download-report-btn">📄 Download Complete Report</a>
        <a href="student-dashboard.php" class="download-report-btn" style="margin-left: 15px; background: linear-gradient(45deg, #43a047, #2e7d32);">📊 View All Reports</a>
    </div>
</div>

<!-- FEATURES -->
<section class="features" id="features">
    <h2>Why LabTrack?</h2>
    <div class="feature-grid">
        <div class="feature-card">
            <h3>🎓 Student First</h3>
            <p>Submit issues in seconds, no manual registers.</p>
        </div>

        <div class="feature-card">
            <h3>⚡ Fast Resolution</h3>
            <p>Admins see issues instantly and act quickly.</p>
        </div>

        <div class="feature-card">
            <h3>📊 Smart Records</h3>
            <p>All complaints stored for analysis & reports.</p>
        </div>
    </div>
</section>

<!-- SYSTEM INFORMATION -->
<div class="system-info-card">
    <h3 class="system-info-title">Current Lab Systems Status</h3>
    <div class="system-info-content">
        <a href="student-dashboard.php" class="system-info-link">
            <div class="system-info-item">
                <span class="system-info-label">Active Labs</span>
                <span class="system-info-value">4</span>
            </div>
        </a>
        <a href="admin-dashboard.php" class="system-info-link">
            <div class="system-info-item">
                <span class="system-info-label">Active Issues</span>
                <span class="system-info-value">12</span>
            </div>
        </a>
        <a href="#" class="system-info-link" onclick="showSystemsInfo()">
            <div class="system-info-item">
                <span class="system-info-label">Systems Online</span>
                <span class="system-info-value">128</span>
            </div>
        </a>
        <a href="#" class="system-info-link" onclick="showUpdateTime()">
            <div class="system-info-item">
                <span class="system-info-label">Last Updated</span>
                <span class="system-info-value">Today</span>
            </div>
        </a>
    </div>
</div>

<!-- REPORT SUMMARY -->
<div class="system-info-card notification-badge" data-count="<?php echo $pending_reports; ?>">
    <h3 class="system-info-title">Lab Issue Reports Summary</h3>
    <div class="system-info-content">
        <a href="monthly-reports.php" class="system-info-link">
            <div class="system-info-item">
                <span class="system-info-label">Total Reports</span>
                <span class="system-info-value"><?php echo $total_reports; ?></span>
            </div>
        </a>
        <a href="admin-dashboard.php?status=pending" class="system-info-link">
            <div class="system-info-item">
                <span class="system-info-label">Pending</span>
                <span class="system-info-value"><?php echo $pending_reports; ?></span>
            </div>
        </a>
        <a href="admin-dashboard.php?status=resolved" class="system-info-link">
            <div class="system-info-item">
                <span class="system-info-label">Resolved</span>
                <span class="system-info-value"><?php echo $resolved_reports; ?></span>
            </div>
        </a>
        <a href="#" class="system-info-link" onclick="showResolutionStats()">
            <div class="system-info-item">
                <span class="system-info-label">Avg. Resolution</span>
                <span class="system-info-value"><?php echo $avg_resolution; ?> days</span>
            </div>
        </a>
    </div>
</div>

</div>

<?php include 'components/footer.php'; ?>

<script>
// Debug logging
console.log('JavaScript loaded');

function closeModal(modalId) {
    console.log('closeModal called for:', modalId);
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

function openIssueModal(title, system, computer, date, status, photo, description, modalId) {
    // Create or update the modal
    let modal = document.getElementById(modalId);
    if (!modal) {
        // Create modal if it doesn't exist
        modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal';
        modal.style.cssText = 'position: fixed; z-index: 10000; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.6); display: block;';
        
        modal.innerHTML = `
            <div class="modal-content" style="background-color: white; margin: 5% auto; padding: 30px; border-radius: 15px; width: 90%; max-width: 600px; box-shadow: 0 15px 40px rgba(0,0,0,0.3); border: 3px solid #0288d1; position: relative;">
                <span class="close" onclick="closeIssueModal('${modalId}')" style="color: #0288d1; float: right; font-size: 32px; font-weight: bold; cursor: pointer; position: absolute; right: 20px; top: 15px; background: #e1f5fe; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease;">&times;</span>
                <div class="modal-header" style="color: #01579b; font-size: 26px; font-weight: 700; margin-bottom: 25px; text-align: center; padding-bottom: 15px; border-bottom: 2px solid #e1f5fe;">Issue Details</div>
                <div class="modal-body">
                    <img src="${photo}" alt="Issue Photo" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 15px;">
                    <p><strong>Description:</strong> ${description}</p>
                    <p><strong>System:</strong> ${system}</p>
                    ${computer ? `<p><strong>Computer:</strong> ${computer}</p>` : ''}
                    <p><strong>Status:</strong> <span class="status-badge ${getStatusClass(status)}" style="padding: 4px 8px; border-radius: 12px; font-size: 12px; background: ${getStatusBg(status)}; color: ${getStatusColor(status)}; border: 2px solid ${getStatusBorder(status)};">${status}</span></p>
                    <p><strong>Reported:</strong> ${date}</p>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    // Show the modal
    modal.style.display = 'block';
    
    // Prevent scrolling when modal is open
    document.body.style.overflow = 'hidden';
}

// Alternative function for direct modal creation
function createIssueModal(issueId, title, system, computer, date, status, photo, description) {
    // Remove any existing temporary modals
    const existingModal = document.getElementById('temp-issue-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal container
    const modal = document.createElement('div');
    modal.id = 'temp-issue-modal';
    modal.className = 'modal';
    modal.style.cssText = 'position: fixed; z-index: 10000; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.6); display: block;';
    
    // Create modal content
    modal.innerHTML = `
        <div class="modal-content" style="background-color: white; margin: 5% auto; padding: 30px; border-radius: 15px; width: 90%; max-width: 600px; box-shadow: 0 15px 40px rgba(0,0,0,0.3); border: 3px solid #0288d1; position: relative;">
            <span class="close" onclick="closeTempModal()" style="color: #0288d1; float: right; font-size: 32px; font-weight: bold; cursor: pointer; position: absolute; right: 20px; top: 15px; background: #e1f5fe; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease;">&times;</span>
            <div class="modal-header" style="color: #01579b; font-size: 26px; font-weight: 700; margin-bottom: 25px; text-align: center; padding-bottom: 15px; border-bottom: 2px solid #e1f5fe;">Issue Details</div>
            <div class="modal-body">
                <img src="${photo}" alt="Issue Photo" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 15px;">
                <p><strong>Description:</strong> ${description}</p>
                <p><strong>System:</strong> ${system}</p>
                ${computer ? `<p><strong>Computer:</strong> ${computer}</p>` : ''}
                <p><strong>Status:</strong> <span class="status-badge ${getStatusClass(status)}" style="padding: 4px 8px; border-radius: 12px; font-size: 12px; background: ${getStatusBg(status)}; color: ${getStatusColor(status)}; border: 2px solid ${getStatusBorder(status)};">${status}</span></p>
                <p><strong>Reported:</strong> ${date}</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Show the modal
    modal.style.display = 'block';
    
    // Prevent scrolling when modal is open
    document.body.style.overflow = 'hidden';
}

function closeIssueModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        // Restore scrolling
        document.body.style.overflow = 'auto';
    }
}

function closeTempModal() {
    const modal = document.getElementById('temp-issue-modal');
    if (modal) {
        modal.style.display = 'none';
        // Restore scrolling
        document.body.style.overflow = 'auto';
    }
}

function getStatusClass(status) {
    switch(status.toLowerCase()) {
        case 'resolved': return 'status-resolved';
        case 'in progress': return 'status-progress';
        default: return 'status-pending';
    }
}

function getStatusBg(status) {
    switch(status.toLowerCase()) {
        case 'resolved': return '#e8f5e8';
        case 'in progress': return '#e3f2fd';
        default: return '#fff3e0';
    }
}

function getStatusColor(status) {
    switch(status.toLowerCase()) {
        case 'resolved': return '#388e3c';
        case 'in progress': return '#1976d2';
        default: return '#f57c00';
    }
}

function getStatusBorder(status) {
    switch(status.toLowerCase()) {
        case 'resolved': return '#4caf50';
        case 'in progress': return '#64b5f6';
        default: return '#ffb74d';
    }
}

// Close modal when clicking outside of it
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

// Test function to manually trigger modals
function testModals() {
    console.log('Testing all modals...');
    showSystemsInfo();
    setTimeout(() => {
        closeModal('systemsModal');
        showUpdateTime();
    }, 2000);
}

// Scroll animation
window.addEventListener('scroll', function() {
    const elements = document.querySelectorAll('.fade-in-element');
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
            element.classList.add('visible');
        }
    });
});

// Initialize animations on load
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing...');
    
    // Add fade-in class to elements
    const fadeElements = document.querySelectorAll('.system-info-card, .feature-card, .gallery-item');
    fadeElements.forEach((element, index) => {
        element.classList.add('fade-in-element');
        element.style.transitionDelay = (index * 0.1) + 's';
    });
    
    // Check if modals exist
    const modals = ['systemsModal', 'updateModal', 'resolutionModal', 'quickStatsModal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        console.log(`${modalId}: ${modal ? 'Found' : 'NOT FOUND!'}`);
    });
    
    // Trigger initial scroll check
    window.dispatchEvent(new Event('scroll'));
    
    console.log('Initialization complete');
});
</script>

</body>
</html>
