const userSchema = new mongoose.Schema({
  discordId: { type: String, required: true, unique: true },
  email: { type: String, unique: true, sparse: true },
  username: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);
