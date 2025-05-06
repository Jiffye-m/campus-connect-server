const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (email) => /@uniport\.edu\.ng$/.test(email),
      message: "Only @uniport.edu.ng emails allowed",
    }
  },
  password: { type: String, required: true },
  avatar: { type: String, default: "" },
  online: { type: Boolean, default: false },
  verified: { type: Boolean, default: false },
  otp: String,
  otpExpires: Date,
  contacts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] 
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
