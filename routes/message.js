const router = require("express").Router();
const Message = require("../models/Message");
const createUploader = require("../utils/uploadMiddleware");

// Get messages between two users
router.get("/:userId1/:userId2", async (req, res) => {
  const { userId1, userId2 } = req.params;
  const messages = await Message.find({
    $or: [
      { sender: userId1, receiver: userId2 },
      { sender: userId2, receiver: userId1 }
    ]
  }).sort({ createdAt: 1 });
  res.json(messages);
});

// POST /api/messages/
router.post("/", async (req, res) => {
  const { sender, receiver, content, mediaUrl } = req.body;
  try {
    const message = await Message.create({ sender, receiver, content, mediaUrl });
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ msg: "Failed to send message", error: error.message });
  }
});

// POST /api/messages/:messageId/status
router.post("/:messageId/status", async (req, res) => {
  const { status } = req.body;
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.messageId,
      { status },
      { new: true }
    );
    res.json(message);
  } catch (error) {
    res.status(500).json({ msg: "Failed to update status", error: error.message });
  }
});

// Upload direct messages
const messageUploader = createUploader("messages");

router.post("/upload", messageUploader.single("file"), async (req, res) => {
  const { sender, receiver, content } = req.body;

  if (!req.file) return res.status(400).json({ msg: "No file uploaded" });

  const mediaUrl = `/uploads/messages/${req.file.filename}`;
  const message = await Message.create({ sender, receiver, content, mediaUrl });

  res.status(201).json(message);
});

module.exports = router;
