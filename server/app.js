// server/app.js

// 1) Require path first so we can use it in dotenv
const path = require('path');

// 2) Load .env from the same folder as this file
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// 3) Serve static files from the project root (one level up from server/)
app.use(cors());
app.use(express.static(path.join(__dirname, '../')));

// 4) AWS S3 configuration
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
});
const s3 = new AWS.S3();

// 5) Multer setup — stores in uploads/ temporarily
const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const fileStream = fs.createReadStream(req.file.path);
  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: req.file.originalname,
    Body: fileStream,
    ContentType: req.file.mimetype,
  };

  s3.upload(params, (err, data) => {
    // delete temp file
    fs.unlink(req.file.path, () => {});

    if (err) {
      console.error('S3 Upload Error:', err);
      return res.status(500).json({ error: 'Upload to S3 failed' });
    }

    // respond with the S3 URL
    res.json({ url: data.Location });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
