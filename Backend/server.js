const express = require('express');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/database');
const { auth, requireRole } = require('./middleware/auth');
const { generateClassCode, isValidClassCode } = require('./utils/classCodeGenerator');

// Models
const User = require('./models/User');
const Course = require('./models/Course');
const Lecture = require('./models/Lecture');
const Assignment = require('./models/Assignment');
const Announcement = require('./models/Announcement');
const ChatMessage = require('./models/ChatMessage');
const ChatBot = require('./models/ChatBot');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(require('cors')({ origin: 'http://localhost:5173' }));

// ==================== AUTHENTICATION ROUTES ====================

// Register user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!['TEACHER', 'STUDENT', 'TA'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create user
    const user = new User({ name, email, password, role });
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user profile
app.get('/api/auth/me', auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        avatar: req.user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== COURSE ROUTES ====================

// Create course
app.post('/api/courses/add-course', auth, requireRole(['TEACHER']), async (req, res) => {
  try {
    const { name, description } = req.body;
    const teacherId = req.user._id;

    if (!name || !description) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Generate unique class code
    let classCode = generateClassCode();
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const existingCourse = await Course.findOne({ classCode });
      if (!existingCourse) break;
      classCode = generateClassCode();
      attempts++;
    }

    if (attempts === maxAttempts) {
      return res.status(500).json({ error: 'Unable to generate unique class code' });
    }

    // Create course
    const course = new Course({
      name,
      description,
      classCode,
      teacherId,
      taIds: [],
      studentIds: []
    });
    await course.save();

    // Populate teacher info
    await course.populate('teacherId', 'name email avatar');

    res.status(201).json({
      course,
      message: 'Course created successfully!'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Join course with class code
app.post('/api/courses/join', auth, requireRole(['STUDENT']), async (req, res) => {
  try {
    const { classCode } = req.body;
    const studentId = req.user._id;

    if (!classCode) {
      return res.status(400).json({ error: 'Class code is required' });
    }

    const course = await Course.findOne({ classCode: classCode.toLowerCase() })
      .populate('teacherId', 'name email');

    if (!course) {
      return res.status(404).json({ error: 'Course not found. Please check the class code.' });
    }

    // Check if student is already enrolled
    const isAlreadyEnrolled = course.studentIds.includes(studentId);
    if (isAlreadyEnrolled) {
      return res.status(400).json({ error: 'You are already enrolled in this course.' });
    }

    // Add student to course
    course.studentIds.push(studentId);
    await course.save();

    // Add course to student's enrolled courses
    await User.findByIdAndUpdate(studentId, {
      $push: { studentCourseIds: course._id }
    });

    res.json({
      course,
      message: `Successfully joined ${course.name}!`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get course by ID
app.get('/api/courses/:id', auth, async (req, res) => {
  try {
    const courseId = req.params.id;

    const course = await Course.findById(courseId)
      .populate('teacherId', 'name email avatar')
      .populate('tas', 'name email avatar')
      .populate('students', 'name email avatar')
      .populate('assignments')
      .populate('announcements');

    if (!course) {
      return res.status(404).json({ error: 'Course not found.' });
    }

    res.json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all courses for current user
app.get('/api/courses', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const courses = await Course.find({
      $or: [
        { teacherId: userId },
        { taIds: userId },
        { studentIds: userId }
      ]
    })
    .populate('teacherId', 'name email avatar')
    .populate('tas', 'name email avatar')
    .populate('students', 'name email avatar');

    res.json({ courses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== PEOPLE MANAGEMENT ROUTES ====================

// Add person to course
app.post('/api/courses/:id/people', auth, requireRole(['TEACHER']), async (req, res) => {
  try {
    const courseId = req.params.id;
    const { email, role } = req.body;
    const teacherId = req.user._id;

    if (!email || !role) {
      return res.status(400).json({ error: 'Email and role are required.' });
    }

    // Verify requester is the teacher
    const course = await Course.findById(courseId);
    if (!course || course.teacherId.toString() !== teacherId.toString()) {
      return res.status(403).json({ error: 'Only the course teacher can add people.' });
    }

    // Find user to add
    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Check if user is already in the course
    const isAlreadyStudent = course.studentIds.includes(userToAdd._id);
    const isAlreadyTA = course.taIds.includes(userToAdd._id);

    if (isAlreadyStudent || isAlreadyTA) {
      return res.status(409).json({ error: 'User is already in this course.' });
    }

    // Update course and user based on role
    if (role === 'STUDENT') {
      course.studentIds.push(userToAdd._id);
      userToAdd.studentCourseIds.push(courseId);
    } else if (role === 'TA') {
      course.taIds.push(userToAdd._id);
      userToAdd.taCourseIds.push(courseId);
    }

    await course.save();
    await userToAdd.save();

    res.json({ message: 'User added successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove person from course
app.delete('/api/courses/:id/people/:userId', auth, requireRole(['TEACHER']), async (req, res) => {
  try {
    const { id: courseId, userId } = req.params;
    const teacherId = req.user._id;

    // Verify requester is the teacher
    const course = await Course.findById(courseId);
    if (!course || course.teacherId.toString() !== teacherId.toString()) {
      return res.status(403).json({ error: 'Only the course teacher can remove people.' });
    }

    // Remove from TAs and Students
    course.taIds = course.taIds.filter(id => id.toString() !== userId);
    course.studentIds = course.studentIds.filter(id => id.toString() !== userId);
    await course.save();

    // Remove course from user's arrays
    await User.findByIdAndUpdate(userId, {
      $pull: { 
        taCourseIds: courseId,
        studentCourseIds: courseId
      }
    });

    res.json({ message: 'User removed successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== ANNOUNCEMENT ROUTES ====================

// Create announcement
app.post('/api/courses/:id/announcements', auth, async (req, res) => {
  try {
    const courseId = req.params.id;
    const { title, content } = req.body;
    const userId = req.user._id;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required.' });
    }

    // Verify user has permission (teacher or TA)
    const course = await Course.findById(courseId);
    const isTeacher = course.teacherId.toString() === userId.toString();
    const isTA = course.taIds.includes(userId);

    if (!isTeacher && !isTA) {
      return res.status(403).json({ error: 'You don\'t have permission to create announcements in this course.' });
    }

    const announcement = new Announcement({
      title,
      content,
      courseId,
      date: new Date()
    });
    await announcement.save();

    res.status(201).json({
      announcement: {
        ...announcement.toObject(),
        author: {
          name: req.user.name,
          role: req.user.role
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get announcements
app.get('/api/courses/:id/announcements', auth, async (req, res) => {
  try {
    const courseId = req.params.id;

    const announcements = await Announcement.find({ courseId })
      .populate('courseId')
      .sort({ date: -1 });

    const formattedAnnouncements = announcements.map(announcement => ({
      id: announcement._id,
      title: announcement.title,
      content: announcement.content,
      date: announcement.date,
      author: {
        name: announcement.courseId.teacherId?.name || 'Teacher',
        role: 'TEACHER'
      }
    }));

    res.json({ announcements: formattedAnnouncements });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== ASSIGNMENT ROUTES ====================

// Create assignment
app.post('/api/courses/:id/assignments', auth, async (req, res) => {
  try {
    const courseId = req.params.id;
    const { title, description, dueDate, maxScore } = req.body;
    const userId = req.user._id;

    if (!title || !description || !dueDate || !maxScore) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Verify user has permission (teacher or TA)
    const course = await Course.findById(courseId);
    const isTeacher = course.teacherId.toString() === userId.toString();
    const isTA = course.taIds.includes(userId);

    if (!isTeacher && !isTA) {
      return res.status(403).json({ error: 'You don\'t have permission to create assignments in this course.' });
    }

    const assignment = new Assignment({
      title,
      description,
      dueDate: new Date(dueDate),
      maxScore: parseInt(maxScore),
      materials: [],
      courseId
    });
    await assignment.save();

    res.status(201).json({
      assignment: {
        ...assignment.toObject(),
        author: {
          name: req.user.name,
          role: req.user.role
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get assignments
app.get('/api/courses/:id/assignments', auth, async (req, res) => {
  try {
    const courseId = req.params.id;

    const assignments = await Assignment.find({ courseId })
      .populate('courseId')
      .sort({ dueDate: 1 });

    const formattedAssignments = assignments.map(assignment => ({
      id: assignment._id,
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.dueDate,
      maxScore: assignment.maxScore,
      materials: assignment.materials,
      author: {
        name: assignment.courseId.teacherId?.name || 'Teacher',
        role: 'TEACHER'
      }
    }));

    res.json({ assignments: formattedAssignments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== LECTURE ROUTES ====================

// Create lecture
app.post('/api/courses/:id/lectures', auth, async (req, res) => {
  try {
    const courseId = req.params.id;
    const { title, description, materials } = req.body;
    const userId = req.user._id;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required.' });
    }

    // Verify user has permission (teacher or TA)
    const course = await Course.findById(courseId);
    const isTeacher = course.teacherId.toString() === userId.toString();
    const isTA = course.taIds.includes(userId);

    if (!isTeacher && !isTA) {
      return res.status(403).json({ error: 'You don\'t have permission to upload lectures in this course.' });
    }

    const lecture = new Lecture({
      title,
      description,
      materials: materials || [],
      courseId,
      authorId: userId,
      uploadDate: new Date()
    });
    await lecture.save();

    await lecture.populate('authorId', 'name role');

    res.status(201).json({
      lecture: {
        ...lecture.toObject(),
        author: {
          name: lecture.authorId.name,
          role: lecture.authorId.role
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get lectures
app.get('/api/courses/:id/lectures', auth, async (req, res) => {
  try {
    const courseId = req.params.id;

    const lectures = await Lecture.find({ courseId })
      .populate('authorId', 'name role')
      .sort({ uploadDate: -1 });

    const formattedLectures = lectures.map(lecture => ({
      id: lecture._id,
      title: lecture.title,
      description: lecture.description,
      materials: lecture.materials,
      uploadDate: lecture.uploadDate,
      author: {
        name: lecture.authorId.name,
        role: lecture.authorId.role
      }
    }));

    res.json({ lectures: formattedLectures });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== CHAT ROUTES ====================

// Send chat message
app.post('/api/courses/:id/chat', auth, async (req, res) => {
  try {
    const courseId = req.params.id;
    const { content } = req.body;
    const userId = req.user._id;

    if (!content) {
      return res.status(400).json({ error: 'Content is required.' });
    }

    // Verify user is enrolled in the course
    const course = await Course.findById(courseId);
    const isEnrolled = course.studentIds.includes(userId) || 
                      course.taIds.includes(userId) || 
                      course.teacherId.toString() === userId.toString();

    if (!isEnrolled) {
      return res.status(403).json({ error: 'You are not enrolled in this course.' });
    }

    const message = new ChatMessage({
      content,
      courseId,
      authorId: userId,
      timestamp: new Date()
    });
    await message.save();

    await message.populate('authorId', 'name email avatar');

    res.status(201).json({
      message: {
        id: message._id,
        content: message.content,
        timestamp: message.timestamp,
        author: {
          name: message.authorId.name,
          email: message.authorId.email,
          avatar: message.authorId.avatar
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get chat messages
app.get('/api/courses/:id/chat', auth, async (req, res) => {
  try {
    const courseId = req.params.id;

    const chatMessages = await ChatMessage.find({ courseId })
      .populate('authorId', 'name email avatar')
      .sort({ timestamp: 1 });

    const formattedMessages = chatMessages.map(message => ({
      id: message._id,
      content: message.content,
      timestamp: message.timestamp,
      author: {
        name: message.authorId.name,
        email: message.authorId.email,
        avatar: message.authorId.avatar
      }
    }));

    res.json({ messages: formattedMessages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== HEALTH CHECK ====================

app.get('/', (req, res) => {
  res.json({ 
    message: 'EduAI API Server is running!',
    timestamp: new Date().toISOString()
  });
});

// 404 Handler - MUST be the last route
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🎯 Server running on port ${PORT}`);
});