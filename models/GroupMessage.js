const mongoose = require("mongoose");

const GroupMessageSchema = new mongoose.Schema({
  group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String },
  mediaUrl: { type: String } // audio, documents, etc.
}, { timestamps: true });

module.exports = mongoose.model("GroupMessage", GroupMessageSchema);
