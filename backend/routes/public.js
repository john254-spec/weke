const express = require('express');
const router = express.Router();
const File = require('../models/File');

router.get('/files', async (req, res) => {
  const files = await File.find();
  res.json(files);
});

module.exports = router;