const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  dueDate: { type: Date, required: true },
  materials: [{ type: String }],
  maxScore: { type: Number, required: true },
  
  courseId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course', 
    required: true 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Assignment', assignmentSchema);