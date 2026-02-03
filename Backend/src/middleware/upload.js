// File upload middleware using Multer
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directories exist
const kycUploadsDir = path.join(__dirname, '../../uploads/kyc');
const issuesUploadsDir = path.join(__dirname, '../../uploads/issues');

if (!fs.existsSync(kycUploadsDir)) {
  fs.mkdirSync(kycUploadsDir, { recursive: true });
}
if (!fs.existsSync(issuesUploadsDir)) {
  fs.mkdirSync(issuesUploadsDir, { recursive: true });
}

// Configure storage for KYC documents
const kycStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, kycUploadsDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename: userId_timestamp_originalname
    const userId = req.params.id || req.user.id;
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const filename = `${userId}_${timestamp}_${file.fieldname}${ext}`;
    cb(null, filename);
  }
});

// Configure storage for issue media
const issueStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, issuesUploadsDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename: userId_timestamp_originalname
    const userId = req.user?.id || 'anonymous';
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const filename = `${userId}_${timestamp}${ext}`;
    cb(null, filename);
  }
});

// File filter - only allow images and PDFs
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images (JPEG, JPG, PNG) and PDF files are allowed!'));
  }
};

// Configure multer for KYC
const kycUpload = multer({
  storage: kycStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  },
  fileFilter: fileFilter
});

// Configure multer for issues (videos + images)
const issueFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|mp4|mov|avi|webm/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = /image|video/.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images and videos are allowed!'));
  }
};

const issueUpload = multer({
  storage: issueStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max file size for issues
  },
  fileFilter: issueFileFilter
});

// Middleware for KYC document upload (both front and back)
export const uploadKYCDocuments = kycUpload.fields([
  { name: 'citizenshipFront', maxCount: 1 },
  { name: 'citizenshipBack', maxCount: 1 }
]);

// Middleware for issue media upload (photos/videos)
export const uploadIssueMedia = issueUpload.array('media', 5); // Max 5 files

// Error handling middleware for multer errors
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 5MB.'
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  next();
};

export default kycUpload;
