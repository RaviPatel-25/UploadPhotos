const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Folder to store uploaded images
const uploadFolder = path.join(__dirname, 'photos');

// Ensure the folder exists
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder);
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadFolder);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// Route: Upload Image
app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  res.json({ message: 'Image uploaded successfully', filename: req.file.filename });
});

// Route: Download Image Once and Delete
app.get('/download/:filename', (req, res) => {
  const filePath = path.join(uploadFolder, req.params.filename);

  // Check if the file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found or already downloaded' });
  }

  // Send file for download
  res.download(filePath, (err) => {
    if (err) {
      console.error('Error while downloading:', err);
      return;
    }

    // Delete file after download
    fs.unlink(filePath, (unlinkErr) => {
      if (unlinkErr) {
        console.error('Error while deleting file:', unlinkErr);
      } else {
        console.log(`File deleted after download: ${req.params.filename}`);
      }
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
