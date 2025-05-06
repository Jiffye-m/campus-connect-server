const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const auth = require("./utils/authMiddleware");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"));

  app.use("/api/auth", require("./routes/auth@"));
  app.use('/api/contacts', auth, require("./routes/contacts"));
  app.use("/api/user", auth, require("./routes/user"));
  app.use("/api/message", auth, require("./routes/message"));
  app.use("/api/groups", auth, require("./routes/group"));
  app.use("/api/documents", auth, require("./routes/document"));

module.exports = app;
