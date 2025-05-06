const express = require("express");
const router = express.Router();
const createUploader = require("../utils/uploadMiddleware");
const Document = require("../models/Documents");
const mongoose = require("mongoose");

// Middleware: multer uploader for documents folder
const docUploader = createUploader("documents");

// GET /api/documents — fetch all documents
router.get("/", async (req, res) => {
  try {
    const docs = await Document.find().populate("uploadedBy", "name email"); // Optional: populate uploader info
    res.json(docs);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch documents", error: err.message });
  }
});

// POST /api/documents/upload — upload new document
router.post("/upload", docUploader.single("file"), async (req, res) => {
  try {
    const { title, description } = req.body;

    // Authenticated user ID from token middleware
    const uploadedBy = req.user.id;

    if (!req.file) {
      return res.status(400).json({ msg: "No file uploaded" });
    }

    if (!title) {
      return res.status(400).json({ msg: "Title is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(uploadedBy)) {
      return res.status(400).json({ msg: "Invalid user ID" });
    }

    const fileUrl = `/uploads/documents/${req.file.filename}`;
    const fileType = req.file.originalname.split(".").pop();

    const doc = await Document.create({
      uploadedBy,
      title,
      description,
      fileUrl,
      fileType
    });

    res.status(201).json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Document upload failed", error: err.message });
  }
});

module.exports = router;
