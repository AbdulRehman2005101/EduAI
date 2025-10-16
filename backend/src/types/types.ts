type User = {
  id: string;
  name: string;
  email: string;
  password?: string; // Make optional since Clerk handles auth
  avatar?: string;
  role: "TEACHER" | "STUDENT" | "TA"; // Uppercase to match Prisma enum
  clerkUserId?: string; // Add Clerk user ID
  coursesTaught?: Course[]; // Add relations
  coursesAsTA?: Course[];
  coursesEnrolled?: Course[];
  studentCourseIds?: string[];
  taCourseIds?: string[];
  createdAt?: Date;
  updatedAt?: Date;
};

type Course = {
  id: string;
  name: string;
  classCode: string;
  description: string;
  teacherId: string;
  teacher?: User; // Add relation
  taIds: string[];
  tas?: User[]; // Add relation
  studentIds: string[];
  students?: User[]; // Add relation
  assignments?: Assignment[];
  lectures?: Lecture[];
  announcements?: Announcement[];
  chatMessages?: ChatMessage[];
  chatBots?: ChatBot[];
  createdAt?: Date;
  updatedAt?: Date;
};

type Assignment = {
  id: string;
  courseId: string;
  title: string;
  description: string;
  dueDate: Date;
  materials: string[];
  maxScore: number;
  course?: Course; // Add relation
  // Remove taId - assignments are created by teachers/TAs, not tied to specific TA
};

type Announcement = { // Fixed typo: Announcements → Announcement
  id: string;
  courseId: string;
  title: string;
  content: string;
  date: Date;
  course?: Course; // Add relation
  // Remove taId - announcements are created by teachers/TAs
};

type Lecture = { // Add missing Lecture type
  id: string;
  courseId: string;
  title: string;
  description: string;
  materials: any[]; // JSON type in Prisma
  uploadDate: Date;
  authorId: string;
  author?: User;
  course?: Course;
};

type ChatMessage = { // Add missing ChatMessage type
  id: string;
  courseId: string;
  authorId: string;
  content: string;
  timestamp: Date;
  author?: User;
  course?: Course;
};

type ChatBot = {
  id: string;
  courseId: string;
  studentId: string;
  messages: { sender: "student" | "bot"; message: string; timestamp: Date }[];
  course?: Course;
  student?: User;
};

export type { User, Course, Assignment, Announcement, Lecture, ChatMessage, ChatBot };