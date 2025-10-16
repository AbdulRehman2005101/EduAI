const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  classCode: { type: String, required: true, unique: true },
  
  teacherId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  taIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  studentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual populate for assignments
courseSchema.virtual('assignments', {
  ref: 'Assignment',
  localField: '_id',
  foreignField: 'courseId'
});

// Virtual populate for announcements
courseSchema.virtual('announcements', {
  ref: 'Announcement',
  localField: '_id',
  foreignField: 'courseId'
});

// Virtual populate for lectures
courseSchema.virtual('lectures', {
  ref: 'Lecture',
  localField: '_id',
  foreignField: 'courseId'
});

// Virtual populate for teacher
courseSchema.virtual('teacher', {
  ref: 'User',
  localField: 'teacherId',
  foreignField: '_id',
  justOne: true
});

// Virtual populate for TAs
courseSchema.virtual('tas', {
  ref: 'User',
  localField: 'taIds',
  foreignField: '_id'
});

// Virtual populate for students
courseSchema.virtual('students', {
  ref: 'User',
  localField: 'studentIds',
  foreignField: '_id'
});

module.exports = mongoose.model('Course', courseSchema);