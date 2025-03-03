const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema({
  enrollmentNo: { type: String, required: true, unique: true },
});

const Enrollment = mongoose.model("Enrollment", enrollmentSchema);

module.exports = Enrollment;