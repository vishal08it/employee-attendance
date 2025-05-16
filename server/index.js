const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// User Schema and Model
const userSchema = new mongoose.Schema({
  empId: { type: String, required: true, unique: true },
  name: String,
  email: String,
  password: String,  // Plain text password
  role: String,
});
const User = mongoose.model("User", userSchema);

// Attendance Schema and Model
const attendanceSchema = new mongoose.Schema({
  empId: String,
  date: String,
  punchIn: String,
  punchOut: String,
});
const Attendance = mongoose.model("Attendance", attendanceSchema);

// Register new employee (admin only)
app.post("/api/register", async (req, res) => {
  const { empId, name, email, password, role } = req.body;

  if (!empId || !password || !name || !email || !role) {
    return res.status(400).send("All fields required");
  }

  const existingUser = await User.findOne({ empId });
  if (existingUser) {
    return res.status(400).send("Employee ID already exists");
  }

  const user = await User.create({ empId, name, email, password, role });
  res.json(user);
});

// Login by empId and password (plain)
app.post("/api/login", async (req, res) => {
  const { empId, password } = req.body;
  if (!empId || !password) {
    return res.status(400).send("empId and password required");
  }

  const user = await User.findOne({ empId });
  if (!user || user.password !== password) {
    return res.status(401).send("Invalid empId or password");
  }

  res.json({ empId: user.empId, name: user.name, role: user.role });
});

// Get today's attendance for employee
app.get("/api/attendance/:empId", async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const record = await Attendance.findOne({ empId: req.params.empId, date: today });
  res.json(record || {});
});

// Punch in/out
app.post("/api/punch", async (req, res) => {
  const { empId, type } = req.body;
  const today = new Date().toISOString().slice(0, 10);
  const time = new Date().toLocaleTimeString();

  let record = await Attendance.findOne({ empId, date: today });

  if (!record && type === "in") {
    record = await Attendance.create({ empId, date: today, punchIn: time });
  } else if (record && type === "out" && !record.punchOut) {
    record.punchOut = time;
    await record.save();
  }

  res.json(record);
});

// Admin: get all attendance records
app.get("/api/admin/records", async (req, res) => {
  const records = await Attendance.find();
  res.json(records);
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
