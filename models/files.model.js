const mongoose = require("mongoose");

const fileSchema = mongoose.Schema({
  file: { type: String, required: true },
  filecode: { required: true, type: String },
  userId: { type: String, required: true },
});

const fileModel = mongoose.model("file", fileSchema);

module.exports = { fileModel };
