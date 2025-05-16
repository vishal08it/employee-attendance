const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  empId: String,
  date: String,
  punchIn: {
    time: String,
  },
  punchOut: {
    time: String,
  },
});

module.exports = mongoose.model("Attendance", attendanceSchema);
