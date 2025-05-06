const router = require("express").Router();
const GroupMessage = require("../models/GroupMessage");
const createUploader = require("../utils/uploadMiddleware");


router.post("/:groupId/messages", async (req, res) => {
  const { content, sender, mediaUrl } = req.body;
  const groupId = req.params.groupId;

  const message = await GroupMessage.create({
    group: groupId,
    sender,
    content,
    mediaUrl
  });

  res.json(message);
});

// Get all messages in a group
router.get("/:groupId", async (req, res) => {
    try {
      const messages = await GroupMessage.find({ group: req.params.groupId })
        .populate("sender", "username email avatar")
        .sort({ createdAt: 1 });
  
      res.json(messages);
    } catch (error) {
      res.status(500).json({ msg: "Server error", error: error.message });
    }
  });


  // Upload group messages
const groupUploader = createUploader("group-messages");

  router.post("/:groupId/upload", groupUploader.single("file"), async (req, res) => {
    const { sender, content } = req.body;
    const groupId = req.params.groupId;
  
    if (!req.file) return res.status(400).json({ msg: "No file uploaded" });
  
    const mediaUrl = `/uploads/group-messages/${req.file.filename}`;
    const message = await GroupMessage.create({ group: groupId, sender, content, mediaUrl });
  
    res.status(201).json(message);
  });

module.exports = router;
