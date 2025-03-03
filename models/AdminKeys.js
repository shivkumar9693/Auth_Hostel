const mongoose = require("mongoose");

const adminKeySchema = new mongoose.Schema({
  key: { type: String, required: true },
});

const AdminKey = mongoose.model("AdminKey", adminKeySchema);

module.exports = AdminKey;