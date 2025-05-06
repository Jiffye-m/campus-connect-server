const router = require("express").Router();
const User = require("../models/User");

// 🔍 Search and Add Contact by Email
router.post("/search-add", async (req, res) => {
  try {
    const { userId, contactEmail } = req.body;

    // Don't allow adding yourself
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });
    if (user.email === contactEmail) return res.status(400).json({ msg: "You can't add yourself" });

    // Find the contact
    const contact = await User.findOne({ email: contactEmail });
    if (!contact) return res.status(404).json({ msg: "No user found with that email" });
    if (!contact.verified) return res.status(400).json({ msg: "This user hasn't verified their email" });

    // Already added?
    if (user.contacts.includes(contact._id)) {
      return res.status(400).json({ msg: "User already in contacts" });
    }

    // Add contact
    user.contacts.push(contact._id);
    await user.save();

    res.json({ msg: "Contact added", contact: {
      _id: contact._id,
      username: contact.username,
      email: contact.email,
      avatar: contact.avatar,
      online: contact.online
    }});
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// 📥 Get all contacts for a user
router.get("/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate("contacts", "username email avatar online");
    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json({ contacts: user.contacts });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// 🚫 Remove Contact by Email
router.post("/remove", async (req, res) => {
    try {
      const { userId, contactEmail } = req.body;
  
      // Ensure the user exists
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ msg: "User not found" });
  
      // Don't allow removing yourself
      if (user.email === contactEmail) return res.status(400).json({ msg: "You can't remove yourself" });
  
      // Find the contact to remove
      const contact = await User.findOne({ email: contactEmail });
      if (!contact) return res.status(404).json({ msg: "No user found with that email" });
  
      // Check if the contact is in the user's list
      const contactIndex = user.contacts.indexOf(contact._id);
      if (contactIndex === -1) {
        return res.status(400).json({ msg: "User not in contacts" });
      }
  
      // Remove contact from user's list
      user.contacts.splice(contactIndex, 1);
      await user.save();
  
      // Optionally, remove the user from the contact's contacts list (if mutual)
      const contactIndexInContact = contact.contacts.indexOf(user._id);
      if (contactIndexInContact !== -1) {
        contact.contacts.splice(contactIndexInContact, 1);
        await contact.save();
      }
  
      res.json({ msg: "Contact removed", contact: {
        _id: contact._id,
        username: contact.username,
        email: contact.email,
        avatar: contact.avatar,
        online: contact.online
      }});
    } catch (error) {
      res.status(500).json({ msg: "Server error", error: error.message });
    }
  });

module.exports = router;
