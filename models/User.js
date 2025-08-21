import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  discordId: { type: String, required: true, unique: true },
  username: { type: String },
  commandsUsed: { type: Number, default: 0 },
  joinedAt: { type: Date, default: Date.now },
});

export default mongoose.model('User', userSchema);
