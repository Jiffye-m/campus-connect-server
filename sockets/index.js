const Message = require("../models/Message");
const GroupMessage = require("../models/GroupMessage");
const Group = require("../models/Group");

module.exports = (io) => {
  const onlineUsers = new Map();

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("add-user", (userId) => {
      onlineUsers.set(userId, socket.id);
    });

    // DIRECT MESSAGE
    socket.on("sendMessage", async (data) => {
      const { from, to, content, mediaUrl } = data;

      try {
        const newMessage = await Message.create({
          sender: from,
          receiver: to,
          content,
          mediaUrl,
        });

        const sendUserSocket = onlineUsers.get(to);
        if (sendUserSocket) {
          io.to(sendUserSocket).emit("receiveMessage", newMessage);
        }

        socket.emit("messageSent", newMessage);
      } catch (error) {
        console.error("Direct message save error:", error.message);
        socket.emit("messageError", { msg: "Failed to send message", error: error.message });
      }
    });

    // GROUP MESSAGE
    socket.on("sendGroupMessage", async (data) => {
      const { from, groupId, content, mediaUrl } = data;

      try {
        // Save message to DB
        const groupMessage = await GroupMessage.create({
          group: groupId,
          sender: from,
          content,
          mediaUrl,
        });

        // Fetch group members to emit
        const group = await Group.findById(groupId);
        if (!group) return;

        group.members.forEach(memberId => {
          if (memberId.toString() !== from) {
            const memberSocket = onlineUsers.get(memberId.toString());
            if (memberSocket) {
              io.to(memberSocket).emit("receiveGroupMessage", {
                ...groupMessage._doc,
                group: groupId,
              });
            }
          }
        });

        // Acknowledge to sender
        socket.emit("groupMessageSent", groupMessage);

      } catch (err) {
        console.error("Group message save error:", err.message);
        socket.emit("groupMessageError", { msg: "Failed to send group message", error: err.message });
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }
    });
  });
};
