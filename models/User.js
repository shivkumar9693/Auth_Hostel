const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  username: String,
  password: String,
  role: { type: String, enum: ["admin", "student"], required: true },
  enrollmentNo: {
    type: String,
    required: function () {
      return this.role === "student";
    },
  },
  adminKey: {
    type: String,
    required: function () {
      return this.role === "admin";
    },
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;