<?php
session_start();
include "db.php";

if(!isset($_SESSION['student'])){
    header("Location: login.php");
    exit();
}

$upload_success = false;
$upload_error = '';

if(isset($_POST['submit'])){
    $student = $_SESSION['student'];
    $lab = $_POST['lab'];
    $type = $_POST['type'];
    $desc = $_POST['desc'];
    
    $photo_path = null;
    $hardware_photo_path = null;
    $system_number = $_POST['system_number'] ?? null;
    
    // Handle general issue photo upload
    if(isset($_FILES['issue_photo']) && $_FILES['issue_photo']['error'] == 0) {
        $allowed_types = ['image/jpeg', 'image/png', 'image/gif'];
        $max_size = 5 * 1024 * 1024; // 5MB
        
        if(in_array($_FILES['issue_photo']['type'], $allowed_types) && $_FILES['issue_photo']['size'] <= $max_size) {
            $file_extension = pathinfo($_FILES['issue_photo']['name'], PATHINFO_EXTENSION);
            $new_filename = uniqid() . '_' . time() . '.' . $file_extension;
            $upload_path = 'uploads/' . $new_filename;
            
            if(move_uploaded_file($_FILES['issue_photo']['tmp_name'], $upload_path)) {
                $photo_path = $upload_path;
            } else {
                $upload_error = 'Failed to upload photo. Please try again.';
            }
        } else {
            $upload_error = 'Invalid file type or file too large. Please upload JPG, PNG, or GIF under 5MB.';
        }
    }
    
    // Handle hardware-specific photo upload
    if(isset($_FILES['hardware_photo']) && $_FILES['hardware_photo']['error'] == 0) {
        $allowed_types = ['image/jpeg', 'image/png', 'image/gif'];
        $max_size = 5 * 1024 * 1024; // 5MB
        
        if(in_array($_FILES['hardware_photo']['type'], $allowed_types) && $_FILES['hardware_photo']['size'] <= $max_size) {
            $file_extension = pathinfo($_FILES['hardware_photo']['name'], PATHINFO_EXTENSION);
            $new_filename = 'hw_' . uniqid() . '_' . time() . '.' . $file_extension;
            $upload_path = 'uploads/' . $new_filename;
            
            if(move_uploaded_file($_FILES['hardware_photo']['tmp_name'], $upload_path)) {
                $hardware_photo_path = $upload_path;
            } else {
                $upload_error = 'Failed to upload hardware photo. Please try again.';
            }
        } else {
            $upload_error = 'Invalid hardware photo type or file too large. Please upload JPG, PNG, or GIF under 5MB.';
        }
    }
    
    if(empty($upload_error)) {
        $stmt = mysqli_prepare($conn, "INSERT INTO issues (prn, lab, issue_type, description, photo_path, system_number, hardware_photo_path) VALUES (?, ?, ?, ?, ?, ?, ?)");
        if($stmt) {
            mysqli_stmt_bind_param($stmt, "sssssss", $student, $lab, $type, $desc, $photo_path, $system_number, $hardware_photo_path);
            
            if(mysqli_stmt_execute($stmt)) {
                // Update days tracking
                $issue_id = mysqli_insert_id($conn);
                $created_date = date('Y-m-d');
                mysqli_query($conn, "UPDATE issues SET days_pending = DATEDIFF(NOW(), created_at) WHERE id = $issue_id AND status = 'Pending'");
                        
                $upload_success = true;
                mysqli_stmt_close($stmt);
                header("Location: student-dashboard.php");
                exit();
            } else {
                $upload_error = 'Failed to submit issue. Please try again.';
            }
            mysqli_stmt_close($stmt);
        } else {
            $upload_error = 'Database error. Please try again.';
        }
    }
}
?>
<!DOCTYPE html>
<html>
<head>
<title>Submit Issue | LabTrack</title>
<link rel="stylesheet" href="css/clean-style.css">
</head>
<body>

<?php include 'components/header.php'; ?>

<div class="main-content">

<div class="card" style="max-width: 500px; margin: 40px auto;">
<div class="card-header">
    <h2 class="card-title">Report Lab Issue</h2>
    <p class="card-subtitle">Submit a new issue with optional photo evidence</p>
</div>

<?php if($upload_success): ?>
<div class="alert alert-success">
    Issue submitted successfully!
</div>
<?php endif; ?>

<?php if(!empty($upload_error)): ?>
<div class="alert alert-error">
    <?php echo $upload_error; ?>
</div>
<?php endif; ?>

<form method="POST" enctype="multipart/form-data">
    <div class="form-group">
        <label class="form-label">Student PRN</label>
        <input type="text" class="form-control" value="<?php echo htmlspecialchars($_SESSION['student']); ?>" readonly>
    </div>
    
    <div class="form-group">
        <label class="form-label">Lab *</label>
        <select name="lab" class="form-control" required>
            <option value="">Select Lab</option>
            <option value="Lab 1">Lab 1</option>
            <option value="Lab 2">Lab 2</option>
            <option value="Lab 3">Lab 3</option>
            <option value="Lab 4">Lab 4</option>
            <option value="Computer Center">Computer Center</option>
        </select>
    </div>
    
    <div class="form-group">
        <label class="form-label">System Number (Optional)</label>
        <input type="text" name="system_number" class="form-control" placeholder="e.g., PC-01, SYS-101">
        <small style="color: #94a3b8; display: block; margin-top: 5px;">Enter the specific computer/system number if applicable</small>
    </div>
    
    <div class="form-group">
        <label class="form-label">Issue Type *</label>
        <select name="type" class="form-control" required>
            <option value="">Select Issue Type</option>
            <option value="Hardware Issue">Hardware Issue</option>
            <option value="Software Issue">Software Issue</option>
            <option value="Network Issue">Network Issue</option>
            <option value="Peripheral Issue">Peripheral Issue</option>
            <option value="Internet Issue">Internet Issue</option>
            <option value="Other">Other</option>
        </select>
    </div>
    
    <div class="form-group">
        <label class="form-label">Description *</label>
        <textarea name="desc" class="form-control" placeholder="Describe the issue in detail..." required style="height: 120px;"></textarea>
    </div>
    
    <div class="form-group">
        <label class="form-label">General Photo Evidence (Optional)</label>
        <input type="file" name="issue_photo" class="form-control" accept="image/*">
        <small style="color: #94a3b8; display: block; margin-top: 5px;">Upload JPG, PNG, or GIF images (max 5MB)</small>
    </div>
    
    <div class="form-group">
        <label class="form-label">Hardware Photo (Optional)</label>
        <input type="file" name="hardware_photo" class="form-control" accept="image/*">
        <small style="color: #94a3b8; display: block; margin-top: 5px;">Specific hardware issue photo (max 5MB)</small>
    </div>
    
    <div class="form-group" style="text-align: center; margin: 20px 0;">
        <button type="button" id="cameraBtn" class="btn btn-secondary" style="margin-right: 10px;">📸 Capture Photo</button>
        <small style="color: #94a3b8; display: block; margin-top: 10px;">Use camera to capture issue photo directly</small>
    </div>
    
    <button type="submit" name="submit" class="btn btn-primary" style="width: 100%;">Submit Issue</button>
</form>

<div style="margin-top: 20px; text-align: center;">
    <a href="student-dashboard.php" class="btn btn-secondary">View My Issues</a>
</div>

</div>

</div>

<?php include 'components/footer.php'; ?>

<!-- Camera Modal -->
<div id="cameraModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 2000; align-items: center; justify-content: center;">
    <div class="card" style="max-width: 600px; margin: 20px; background: rgba(15, 23, 42, 0.95);">
        <div class="card-header">
            <h2 class="card-title">📸 Camera Capture</h2>
            <p class="card-subtitle">Take a photo of the issue</p>
        </div>
        <div style="text-align: center; padding: 20px;">
            <video id="cameraVideo" autoplay style="width: 100%; max-width: 400px; border-radius: 10px; margin-bottom: 20px;"></video>
            <canvas id="cameraCanvas" style="display: none; width: 100%; max-width: 400px; border-radius: 10px;"></canvas>
            <div style="margin-top: 20px;">
                <button id="captureBtn" class="btn btn-primary" style="margin: 0 10px;">Capture Photo</button>
                <button id="retakeBtn" class="btn btn-secondary" style="margin: 0 10px; display: none;">Retake</button>
                <button id="usePhotoBtn" class="btn btn-success" style="margin: 0 10px; display: none;">Use This Photo</button>
                <button id="closeCameraBtn" class="btn btn-danger" style="margin: 0 10px;">Cancel</button>
            </div>
        </div>
    </div>
</div>

<script>
let cameraStream = null;
let capturedBlob = null;

// Camera functionality
document.getElementById('cameraBtn').addEventListener('click', async function() {
    const modal = document.getElementById('cameraModal');
    const video = document.getElementById('cameraVideo');
    const canvas = document.getElementById('cameraCanvas');
    
    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } 
        });
        video.srcObject = cameraStream;
        modal.style.display = 'flex';
        document.getElementById('captureBtn').style.display = 'inline-block';
        document.getElementById('retakeBtn').style.display = 'none';
        document.getElementById('usePhotoBtn').style.display = 'none';
        canvas.style.display = 'none';
        video.style.display = 'block';
    } catch (err) {
        alert('Camera access denied or not available. Please use file upload instead.');
        console.error('Camera error:', err);
    }
});

// Capture photo
document.getElementById('captureBtn').addEventListener('click', function() {
    const video = document.getElementById('cameraVideo');
    const canvas = document.getElementById('cameraCanvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob(function(blob) {
        capturedBlob = blob;
        video.style.display = 'none';
        canvas.style.display = 'block';
        document.getElementById('captureBtn').style.display = 'none';
        document.getElementById('retakeBtn').style.display = 'inline-block';
        document.getElementById('usePhotoBtn').style.display = 'inline-block';
    }, 'image/jpeg', 0.8);
});

// Retake photo
document.getElementById('retakeBtn').addEventListener('click', function() {
    const video = document.getElementById('cameraVideo');
    const canvas = document.getElementById('cameraCanvas');
    
    video.style.display = 'block';
    canvas.style.display = 'none';
    document.getElementById('captureBtn').style.display = 'inline-block';
    document.getElementById('retakeBtn').style.display = 'none';
    document.getElementById('usePhotoBtn').style.display = 'none';
    capturedBlob = null;
});

// Use captured photo
document.getElementById('usePhotoBtn').addEventListener('click', function() {
    if (capturedBlob) {
        // Create file input and assign the blob
        const fileInput = document.querySelector('input[name="issue_photo"]');
        const file = new File([capturedBlob], 'camera_capture_' + Date.now() + '.jpg', { type: 'image/jpeg' });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;
        
        closeCamera();
        alert('Photo captured and attached successfully!');
    }
});

// Close camera modal
document.getElementById('closeCameraBtn').addEventListener('click', closeCamera);

document.getElementById('cameraModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeCamera();
    }
});

function closeCamera() {
    const modal = document.getElementById('cameraModal');
    modal.style.display = 'none';
    
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    
    capturedBlob = null;
}
</script>

</body>
</html>
