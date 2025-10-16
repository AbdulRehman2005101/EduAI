const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['TEACHER', 'STUDENT', 'TA'], 
    default: 'STUDENT' 
  },
  avatar: String,
  
  // Reference arrays
  taCourseIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  studentCourseIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);