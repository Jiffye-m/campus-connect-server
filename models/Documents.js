const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema({
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileType: { type: String }, // e.g., pdf, docx
  description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Document", DocumentSchema);
