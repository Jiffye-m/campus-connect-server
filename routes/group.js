const router = require("express").Router();
const Group = require("../models/Group");

// Create new group
router.post("/", async (req, res) => {
  const { name, members, createdBy } = req.body;
  const group = await Group.create({ name, members, createdBy });
  res.json(group);
});

// Get all groups for a user
router.get("/:userId", async (req, res) => {
  const groups = await Group.find({ members: req.params.userId });
  res.json(groups);
});

// Add members to an existing group
// POST /api/groups/:groupId/add-members
router.post("/:groupId/add-members", async (req, res) => {
  try {
    const { newMembers } = req.body; // array of user IDs
    const groupId = req.params.groupId;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ msg: "Group not found" });

    // Add only members not already in the group
    newMembers.forEach(memberId => {
      if (!group.members.includes(memberId)) {
        group.members.push(memberId);
      }
    });

    await group.save();
    res.json({ msg: "Members added successfully", group });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// POST /api/groups/:groupId/remove-member
router.post("/:groupId/remove-member", async (req, res) => {
  try {
    const { userId } = req.body;
    const groupId = req.params.groupId;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ msg: "Group not found" });

    const isMember = group.members.some(
      memberId => memberId.toString() === userId
    );

    if (!isMember) {
      return res.status(400).json({ msg: "User is not a member of the group" });
    }

    // Prevent creator from leaving
    if (group.createdBy.toString() === userId) {
      return res.status(400).json({ msg: "Group creator cannot leave the group" });
    }

    // Remove user from members
    group.members = group.members.filter(
      memberId => memberId.toString() !== userId
    );

    await group.save();
    res.json({ msg: "User removed from group", group });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});




module.exports = router;
