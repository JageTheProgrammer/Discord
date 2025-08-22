import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  discordId: { type: String, required: true, unique: true }, // unique per Discord user
  email: { type: String, unique: true, sparse: true },       // optional, allows multiple nulls
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);
