import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  discordId: { 
    type: String, 
    required: true, 
    unique: true // each Discord user only once
  },
  email: { 
    type: String, 
    unique: true, 
    sparse: true // allows multiple users without email (null)
  },
  username: { 
    type: String 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Ensure indexes are created
userSchema.index({ discordId: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true, sparse: true });

export default mongoose.model('User', userSchema);
