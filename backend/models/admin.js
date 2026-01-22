const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  admin_level: {
    type: String,
    enum: ["super-admin", "support-admin"]
  },
  permissions: [String],
  last_login: Date
}, { timestamps: true });

module.exports = mongoose.model("Admin", adminSchema);
