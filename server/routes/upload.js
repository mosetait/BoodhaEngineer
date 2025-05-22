// routes/upload.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// Upload single image
router.post('/single', protect, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }
  
  res.json({
    success: true,
    data: {
      url: req.file.path,
      publicId: req.file.filename
    }
  });
});

// Upload multiple images (max 5)
router.post('/multiple', protect, upload.array('images', 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No files uploaded'
    });
  }
  
  const uploadedFiles = req.files.map(file => ({
    url: file.path,
    publicId: file.filename
  }));
  
  res.json({
    success: true,
    data: uploadedFiles
  });
});

module.exports = router;