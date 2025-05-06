
const express = require("express");
const router = express.Router();
const createUploader = require("../utils/uploadMiddleware");
const Document = require("../models/Documents");


// Get all documents
router.get("/", async (req, res) => {
  const docs = await Document.find();
  res.json(docs);
});


// POST /api/documents/upload

const docUploader = createUploader("documents");

router.post("/upload", docUploader.single("file"), async (req, res) => {
  const { uploadedBy, title, description } = req.body;

  if (!req.file) return res.status(400).json({ msg: "No file uploaded" });

  const fileUrl = `/uploads/documents/${req.file.filename}`;
  const fileType = req.file.originalname.split(".").pop();

  const doc = await Document.create({ uploadedBy, title, description, fileUrl, fileType });
  res.status(201).json(doc);
});

module.exports = router;
