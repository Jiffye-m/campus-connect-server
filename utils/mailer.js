
const nodemailer = require("nodemailer");

// Mailer setup
const transporter = nodemailer.createTransport({
  service: "gmail", // your mail server
  port: 465,
  secure: true,
  auth: {
    user: "welekwemiracle63@gmail.com",
    pass: "kktmhsjspxzaktmj" // replace with your actual email password
  }
});

module.exports = transporter;
