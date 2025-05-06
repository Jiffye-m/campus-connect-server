const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Reusable function to create a multer instance for any folder
const createUploader = (folderName) => {
  const uploadDir = path.join(__dirname, "..", "uploads", folderName);
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
  });

  return multer({ storage });
};

module.exports = createUploader;
