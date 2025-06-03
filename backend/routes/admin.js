const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect, isAdmin } = require('../middleware/auth');
const File = require('../models/File');

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (_, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});

const upload = multer({ storage });

router.post('/upload', protect, isAdmin, upload.single('file'), async (req, res) => {
  const { description, type } = req.body;
  const newFile = new File({
    name: req.file.filename,
    url: `/uploads/${req.file.filename}`,
    description,
    uploadedBy: req.user.username,
    type
  });
  await newFile.save();
  res.json({ message: 'File uploaded', file: newFile });
});

router.get('/files', protect, isAdmin, async (req, res) => {
  const files = await File.find();
  res.json(files);
});

module.exports = router;