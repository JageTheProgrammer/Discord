const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  discordId: { type: String, required: true, unique: true },
  username: { type: String },            // optional, store the last known username
  commandsUsed: { type: Number, default: 0 }, // track command usage
  joinedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
