const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const transporter = require("../utils/mailer");
const rateLimit = require("express-rate-limit");

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3, // Limit to 3 requests per IP
  message: "Too many OTP requests. Please try again later.",
});

// Register
router.post("/register", otpLimiter, async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!/@uniport\.edu\.ng$/.test(email)) {
      return res.status(400).json({ msg: "Only Uniport emails allowed" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: "Email already registered" });

    const hash = await bcrypt.hash(password, 10);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = await User.create({
      username,
      email,
      password: hash,
      otp,
      otpExpires
    });

    await transporter.sendMail({
      from: '"Campus Connect" <welekwemiracle63@gmail.com>',
      to: email,
      subject: "Verify Your Email with OTP",
      html: `<p>Hello ${username},</p>
             <p>Your OTP is: <b>${otp}</b></p>
             <p>This OTP will expire in 10 minutes.</p>`
    });

    res.json({ msg: "OTP sent to your email. Please verify." });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// Verify OTP
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ msg: "Invalid or expired OTP" });
    }

    user.verified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ msg: "Email verified successfully. You can now log in." });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// Login
// Login + Auto-Resend OTP if not verified
router.post("/login", otpLimiter, async (req, res) => {
    try {
      const { email, password } = req.body;
  
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ msg: "Invalid credentials" });
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });
  
      // If user is not verified
      if (!user.verified) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  
        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();
  
        await transporter.sendMail({
          from: '"Campus Connect" <welekwemiracle63@gmail.com>',
          to: email,
          subject: "Resent OTP for Email Verification",
          html: `<p>Your new OTP is: <b>${otp}</b></p><p>It will expire in 10 minutes.</p>`
        });
  
        return res.status(403).json({ msg: "Email not verified. New OTP has been sent." });
      }

      
// User online status
    user.online = true;
    await user.save();
  
      // If verified, continue login
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
      res.json({ token, user });
    } catch (error) {
      res.status(500).json({ msg: "Server error", error: error.message });
    }
  });

  // Manually Resend OTP
router.post("/resend-otp", otpLimiter, async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
  
      if (!user) return res.status(404).json({ msg: "User not found" });
      if (user.verified) return res.status(400).json({ msg: "User already verified" });
  
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  
      user.otp = otp;
      user.otpExpires = otpExpires;
      await user.save();
  
      await transporter.sendMail({
        from: '"Campus Connect" <welekwemiracle63@gmail.com>',
        to: email,
        subject: "Your OTP for Email Verification",
        html: `<p>Your OTP is: <b>${otp}</b></p><p>This OTP will expire in 10 minutes.</p>`
      });
  
      res.json({ msg: "OTP has been resent to your email." });
    } catch (error) {
      res.status(500).json({ msg: "Server error", error: error.message });
    }
  });

  // Logout + Set user offline
router.post("/logout", async (req, res) => {
    try {
      const { userId } = req.body;
  
      // Find the user by their ID
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ msg: "User not found" });
  
      // Set user to offline
      user.online = false;
      await user.save();
  
      res.json({ msg: "User logged out and marked offline" });
    } catch (error) {
      res.status(500).json({ msg: "Server error", error: error.message });
    }
  });
  
  
  

module.exports = router;
