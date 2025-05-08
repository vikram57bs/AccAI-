import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const User= mongoose.model('User', UserSchema);
export default User;
/*
// In models/user.js
import mongoose from 'mongoose'; // Change from 'require' to 'import'

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

export default mongoose.model('User', UserSchema); // Use default export
*/