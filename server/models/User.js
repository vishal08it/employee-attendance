const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  empId: String,
  name: String,
  email: String,
  password: String,
  role: String,
});

module.exports = mongoose.model("User", userSchema);
