const mongoose = require('mongoose');

const chatBotSchema = new mongoose.Schema({
  messages: { type: mongoose.Schema.Types.Mixed },
  
  courseId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course', 
    required: true 
  },
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ChatBot', chatBotSchema);