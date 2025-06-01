const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  name: String,
  url: String,
  description: String,
  uploadedBy: String,
  type: String
});

module.exports = mongoose.model('File', fileSchema);