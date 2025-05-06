const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  if (!/@uniport\.edu\.ng$/.test(email)) return res.status(400).json({ msg: "Only Uniport emails allowed" });

  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ username, email, password: hash });
  res.json(user);
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ msg: "Invalid credentials" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user });
});

router.get("/verify/:token", async (req, res) => {
    const user = await User.findOne({ verificationToken: req.params.token });
    if (!user) return res.status(400).json({ msg: "Invalid or expired token" });
  
    user.verified = true;
    user.verificationToken = undefined;
    await user.save();
  
    res.json({ msg: "Email verified. You can now log in." });
  });
  

module.exports = router;
