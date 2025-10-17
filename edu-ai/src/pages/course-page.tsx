import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Megaphone,
  BookOpen,
  Video,
  MessageSquare,
  Bot,
  Users,
  Calendar,
  Upload,
  Download,
  Trash2,
  Edit,
  Send,
  UserPlus,
  UserMinus,
  Crown,
  Shield,
  GraduationCap,
} from "lucide-react";
import DashboardHeader from "@/components/shared/header";
import { useParams } from "react-router-dom";
import { useAuth } from "@/context/auth-context";

interface Course {
  id: string;
  name: string;
  classCode: string;
  description: string;
  teacher: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  tas: Array<{
    id: string;
    name: string;
    email: string;
    avatar?: string;
  }>;
  students: Array<{
    id: string;
    name: string;
    email: string;
    avatar?: string;
  }>;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  author: {
    name: string;
    role: string;
  };
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  materials: string[];
  author: {
    name: string;
    role: string;
  };
}

interface Lecture {
  id: string;
  title: string;
  description: string;
  materials: Array<{
    name: string;
    type: string;
    url: string;
  }>;
  uploadDate: string;
  author: {
    name: string;
    role: string;
  };
}

interface ChatMessage {
  id: string;
  content: string;
  timestamp: string;
  author: {
    name: string;
    email: string;
    avatar?: string;
  };
}

const CoursePage = () => {
  const { user } = useAuth();
  const params = useParams();
  const courseId = params.id;

  const [course, setCourse] = useState<Course | null>(null);
  const [activeTab, setActiveTab] = useState("announcements");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const [showAnnouncementDialog, setShowAnnouncementDialog] = useState(false);
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
  const [showLectureDialog, setShowLectureDialog] = useState(false);
  const [showAddPersonDialog, setShowAddPersonDialog] = useState(false);

  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
  });
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    dueDate: "",
    maxScore: 100,
  });
  const [newLecture, setNewLecture] = useState({ title: "", description: "" });
  const [newMessage, setNewMessage] = useState("");
  const [personToAdd, setPersonToAdd] = useState({
    email: "",
    role: "STUDENT",
  });

  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  // Fixed permission checks - handle cases where course might be null
  const isTeacher = user?.role === "TEACHER" && course?.teacher.id === user.id;
  const isTA =
    user?.role === "TA" && course?.tas.some((ta) => ta.id === user.id);
  const canManageContent = isTeacher || isTA;
  const canManagePeople = isTeacher;

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();

      if (!token) {
        setError("Authentication token not found");
        return;
      }

      // Fetch course details
      const courseResponse = await fetch(
        `http://localhost:5000/api/courses/${courseId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!courseResponse.ok) {
        throw new Error("Failed to fetch course data");
      }

      const courseData = await courseResponse.json();

      // Transform backend data to match frontend interface
      const transformedCourse: Course = {
        id: courseData._id,
        name: courseData.name,
        classCode: courseData.classCode,
        description: courseData.description,
        teacher: {
          id: courseData.teacherId._id,
          name: courseData.teacherId.name,
          email: courseData.teacherId.email,
          avatar: courseData.teacherId.avatar,
        },
        tas: (courseData.tas || []).map((ta: any) => ({
          id: ta._id,
          name: ta.name,
          email: ta.email,
          avatar: ta.avatar,
        })),
        students: (courseData.students || []).map((student: any) => ({
          id: student._id,
          name: student.name,
          email: student.email,
          avatar: student.avatar,
        })),
      };

      setCourse(transformedCourse);

      // Fetch content for each tab in parallel
      await Promise.all([
        fetchAnnouncements(),
        fetchAssignments(),
        fetchLectures(),
        fetchChatMessages(),
      ]);
    } catch (error) {
      console.error("Error fetching course data:", error);
      setError("Failed to load course data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(
        `http://localhost:5000/api/courses/${courseId}/announcements`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data.announcements || []);
      } else {
        console.error("Failed to fetch announcements");
        setAnnouncements([]);
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
      setAnnouncements([]);
    }
  };

  const fetchAssignments = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(
        `http://localhost:5000/api/courses/${courseId}/assignments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAssignments(data.assignments || []);
      } else {
        console.error("Failed to fetch assignments");
        setAssignments([]);
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
      setAssignments([]);
    }
  };

  const fetchLectures = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(
        `http://localhost:5000/api/courses/${courseId}/lectures`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setLectures(data.lectures || []);
      } else {
        console.error("Failed to fetch lectures");
        setLectures([]);
      }
    } catch (error) {
      console.error("Error fetching lectures:", error);
      setLectures([]);
    }
  };

  const fetchChatMessages = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(
        `http://localhost:5000/api/courses/${courseId}/chat`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setChatMessages(data.messages || []);
      } else {
        console.error("Failed to fetch chat messages");
        setChatMessages([]);
      }
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      setChatMessages([]);
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const token = getAuthToken();
      const response = await fetch(
        `http://localhost:5000/api/courses/${courseId}/announcements`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: newAnnouncement.title,
            content: newAnnouncement.content,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        await fetchAnnouncements();
        setNewAnnouncement({ title: "", content: "" });
        setShowAnnouncementDialog(false);
      } else {
        alert(data.error || "Failed to create announcement");
      }
    } catch (error) {
      console.error("Error creating announcement:", error);
      alert("Failed to create announcement. Please try again.");
    }
  };

  const handleCreateAssignment = async () => {
    if (
      !newAssignment.title.trim() ||
      !newAssignment.description.trim() ||
      !newAssignment.dueDate
    ) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const token = getAuthToken();
      const response = await fetch(
        `http://localhost:5000/api/courses/${courseId}/assignments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: newAssignment.title,
            description: newAssignment.description,
            dueDate: newAssignment.dueDate,
            maxScore: newAssignment.maxScore,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        await fetchAssignments();
        setNewAssignment({
          title: "",
          description: "",
          dueDate: "",
          maxScore: 100,
        });
        setShowAssignmentDialog(false);
      } else {
        alert(data.error || "Failed to create assignment");
      }
    } catch (error) {
      console.error("Error creating assignment:", error);
      alert("Failed to create assignment. Please try again.");
    }
  };

  const handleCreateLecture = async () => {
    if (!newLecture.title.trim() || !newLecture.description.trim()) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const token = getAuthToken();
      const response = await fetch(
        `http://localhost:5000/api/courses/${courseId}/lectures`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: newLecture.title,
            description: newLecture.description,
            materials: [],
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        await fetchLectures();
        setNewLecture({ title: "", description: "" });
        setShowLectureDialog(false);
      } else {
        alert(data.error || "Failed to create lecture");
      }
    } catch (error) {
      console.error("Error creating lecture:", error);
      alert("Failed to create lecture. Please try again.");
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const token = getAuthToken();
      const response = await fetch(
        `http://localhost:5000/api/courses/${courseId}/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content: newMessage.trim(),
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setNewMessage("");
        // Instead of refetching all messages, optimistically add the new message
        if (data.message) {
          setChatMessages((prev) => [...prev, data.message]);
        } else {
          await fetchChatMessages();
        }

        // Auto-scroll to bottom of chat
        setTimeout(() => {
          const chatContainer = document.querySelector(".chat-messages");
          if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
          }
        }, 100);
      } else {
        alert(data.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    }
  };

  const handleAddPerson = async () => {
    if (!personToAdd.email.trim()) {
      alert("Please enter an email address");
      return;
    }

    try {
      const token = getAuthToken();
      const response = await fetch(
        `http://localhost:5000/api/courses/${courseId}/people`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: personToAdd.email.trim(),
            role: personToAdd.role,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        await fetchCourseData();
        setPersonToAdd({ email: "", role: "STUDENT" });
        setShowAddPersonDialog(false);
        alert(
          `Successfully added ${
            personToAdd.email
          } as ${personToAdd.role.toLowerCase()}`
        );
      } else {
        alert(data.error || "Failed to add person");
      }
    } catch (error) {
      console.error("Error adding person:", error);
      alert("Failed to add person. Please try again.");
    }
  };

  const handleRemovePerson = async (userId: string, personName: string) => {
    if (
      !confirm(
        `Are you sure you want to remove ${personName} from this course?`
      )
    ) {
      return;
    }

    try {
      const token = getAuthToken();
      const response = await fetch(
        `http://localhost:5000/api/courses/${courseId}/people/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        await fetchCourseData();
        alert(`Successfully removed ${personName} from the course`);
      } else {
        alert(data.error || "Failed to remove person");
      }
    } catch (error) {
      console.error("Error removing person:", error);
      alert("Failed to remove person. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex-1 min-h-screen w-full p-6 bg-gradient-to-br from-[#1B2023] to-[#2A2F35]">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 min-h-screen w-full p-6 bg-gradient-to-br from-[#1B2023] to-[#2A2F35]">
        <DashboardHeader title="Error" subtitle="Failed to load course" />
        <div className="text-center py-12">
          <div className="text-red-400 text-lg mb-4">{error}</div>
          <Button
            onClick={fetchCourseData}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex-1 min-h-screen w-full p-6 bg-gradient-to-br from-[#1B2023] to-[#2A2F35]">
        <DashboardHeader title="Course Not Found" subtitle="" />
        <div className="text-center py-12 text-gray-400">
          The requested course could not be found.
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen w-full p-6 bg-gradient-to-br from-[#1B2023] to-[#2A2F35]">
      <DashboardHeader
        title={course.name}
        subtitle={`Class Code: ${course.classCode}`}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6 bg-gray-800 mb-6">
          <TabsTrigger
            value="announcements"
            className="flex items-center gap-2"
          >
            <Megaphone className="h-4 w-4" />
            Announcements
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Assignments
          </TabsTrigger>
          <TabsTrigger value="lectures" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            Lectures
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Group Chat
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            AI Assistant
          </TabsTrigger>
          <TabsTrigger value="people" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            People
          </TabsTrigger>
        </TabsList>

        {/* Announcements Tab */}
        <TabsContent value="announcements" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Announcements</h2>
            {canManageContent && (
              <Dialog
                open={showAnnouncementDialog}
                onOpenChange={setShowAnnouncementDialog}
              >
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Announcement
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-800 border-gray-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">
                      Create Announcement
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Announcement title"
                      value={newAnnouncement.title}
                      onChange={(e) =>
                        setNewAnnouncement({
                          ...newAnnouncement,
                          title: e.target.value,
                        })
                      }
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                    <Textarea
                      placeholder="Announcement content"
                      value={newAnnouncement.content}
                      onChange={(e) =>
                        setNewAnnouncement({
                          ...newAnnouncement,
                          content: e.target.value,
                        })
                      }
                      className="bg-gray-700 border-gray-600 text-white min-h-[120px]"
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={handleCreateAnnouncement}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Create Announcement
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="space-y-4">
            {announcements.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No announcements yet.
              </div>
            ) : (
              announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="bg-gray-800 border border-gray-700 rounded-lg p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-white">
                      {announcement.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {announcement.author.role}
                      </Badge>
                      {canManageContent && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-300 mb-4">{announcement.content}</p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>By {announcement.author.name}</span>
                    <span>
                      {new Date(announcement.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Assignments</h2>
            {canManageContent && (
              <Dialog
                open={showAssignmentDialog}
                onOpenChange={setShowAssignmentDialog}
              >
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Assignment
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-800 border-gray-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">
                      Create Assignment
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Assignment title"
                      value={newAssignment.title}
                      onChange={(e) =>
                        setNewAssignment({
                          ...newAssignment,
                          title: e.target.value,
                        })
                      }
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                    <Textarea
                      placeholder="Assignment description"
                      value={newAssignment.description}
                      onChange={(e) =>
                        setNewAssignment({
                          ...newAssignment,
                          description: e.target.value,
                        })
                      }
                      className="bg-gray-700 border-gray-600 text-white min-h-[100px]"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-300">
                          Due Date
                        </label>
                        <Input
                          type="date"
                          value={newAssignment.dueDate}
                          onChange={(e) =>
                            setNewAssignment({
                              ...newAssignment,
                              dueDate: e.target.value,
                            })
                          }
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-300">
                          Max Score
                        </label>
                        <Input
                          type="number"
                          value={newAssignment.maxScore}
                          onChange={(e) =>
                            setNewAssignment({
                              ...newAssignment,
                              maxScore: Number(e.target.value),
                            })
                          }
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={handleCreateAssignment}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Create Assignment
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="space-y-4">
            {assignments.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No assignments yet.
              </div>
            ) : (
              assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="bg-gray-800 border border-gray-700 rounded-lg p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {assignment.title}
                      </h3>
                      <p className="text-gray-300">{assignment.description}</p>
                    </div>
                    {canManageContent && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex gap-4 text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Due: {new Date(assignment.dueDate).toLocaleDateString()}
                      </span>
                      <span>Max Score: {assignment.maxScore}</span>
                    </div>
                    <Badge variant="secondary">{assignment.author.role}</Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        {/* Lectures Tab */}
        <TabsContent value="lectures" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Lectures</h2>
            {canManageContent && (
              <Dialog
                open={showLectureDialog}
                onOpenChange={setShowLectureDialog}
              >
                <DialogTrigger asChild>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Lecture
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-800 border-gray-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">
                      Upload Lecture
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Lecture title"
                      value={newLecture.title}
                      onChange={(e) =>
                        setNewLecture({ ...newLecture, title: e.target.value })
                      }
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                    <Textarea
                      placeholder="Lecture description"
                      value={newLecture.description}
                      onChange={(e) =>
                        setNewLecture({
                          ...newLecture,
                          description: e.target.value,
                        })
                      }
                      className="bg-gray-700 border-gray-600 text-white min-h-[100px]"
                    />
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-gray-400">
                        Drop files here or click to upload
                      </p>
                      <p className="text-sm text-gray-500">
                        PDF, PPT, MP4, etc.
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={handleCreateLecture}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Upload Lecture
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="space-y-4">
            {lectures.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No lectures yet.
              </div>
            ) : (
              lectures.map((lecture) => (
                <div
                  key={lecture.id}
                  className="bg-gray-800 border border-gray-700 rounded-lg p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {lecture.title}
                      </h3>
                      <p className="text-gray-300 mb-4">
                        {lecture.description}
                      </p>
                      <div className="flex gap-2">
                        {lecture.materials.map((material, index) => (
                          <Button
                            key={index}
                            size="sm"
                            variant="outline"
                            className="text-blue-400 border-blue-400"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            {material.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                    {canManageContent && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-400">
                    <span>By {lecture.author.name}</span>
                    <span>
                      {new Date(lecture.uploadDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        {/* Group Chat Tab */}
        <TabsContent value="chat" className="space-y-4">
          <div className="bg-gray-800 border border-gray-700 rounded-lg">
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">Group Chat</h2>
            </div>
            <div className="h-96 p-4 overflow-y-auto space-y-4 chat-messages">
              {chatMessages.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  No messages yet. Be the first to say hello!
                </div>
              ) : (
                chatMessages.map((message) => (
                  <div key={message.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={message.author.avatar} />
                      <AvatarFallback>
                        {message.author.name?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-white">
                          {message.author.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-gray-300">{message.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-4 border-t border-gray-700">
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="bg-gray-700 border-gray-600 text-white"
                />
                <Button
                  onClick={handleSendMessage}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* AI Assistant Tab */}
        <TabsContent value="ai" className="space-y-4">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="text-center py-12">
              <Bot className="h-16 w-16 mx-auto mb-4 text-blue-400" />
              <h2 className="text-2xl font-bold text-white mb-2">
                AI Assistant
              </h2>
              <p className="text-gray-400">
                Your intelligent course assistant is coming soon!
              </p>
            </div>
          </div>
        </TabsContent>

        {/* People Tab */}
        <TabsContent value="people" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Course Members</h2>
            {canManagePeople && (
              <Dialog
                open={showAddPersonDialog}
                onOpenChange={setShowAddPersonDialog}
              >
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Person
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-800 border-gray-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">
                      Add Person to Course
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Email address"
                      value={personToAdd.email}
                      onChange={(e) =>
                        setPersonToAdd({
                          ...personToAdd,
                          email: e.target.value,
                        })
                      }
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                    <select
                      value={personToAdd.role}
                      onChange={(e) =>
                        setPersonToAdd({ ...personToAdd, role: e.target.value })
                      }
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2"
                    >
                      <option value="STUDENT">Student</option>
                      <option value="TA">Teaching Assistant</option>
                    </select>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={handleAddPerson}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Add Person
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Teachers Section */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Crown className="h-5 w-5 text-yellow-500" />
              <h3 className="text-lg font-semibold text-white">Teacher</h3>
            </div>
            {course.teacher && (
              <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={course.teacher.avatar} />
                    <AvatarFallback>{course.teacher.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-white font-medium">
                      {course.teacher.name}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {course.teacher.email}
                    </p>
                  </div>
                </div>
                <Badge className="bg-yellow-600">Teacher</Badge>
              </div>
            )}
          </div>

          {/* Teaching Assistants Section */}
          {course.tas && course.tas.length > 0 && (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-semibold text-white">
                  Teaching Assistants
                </h3>
              </div>
              <div className="space-y-3">
                {course.tas.map((ta) => (
                  <div
                    key={ta.id}
                    className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={ta.avatar} />
                        <AvatarFallback>{ta.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-white font-medium">{ta.name}</p>
                        <p className="text-gray-400 text-sm">{ta.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-600">TA</Badge>
                      {canManagePeople && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRemovePerson(ta.id, ta.name)}
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Students Section */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="h-5 w-5 text-green-500" />
              <h3 className="text-lg font-semibold text-white">
                Students ({course.students?.length || 0})
              </h3>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {course.students && course.students.length > 0 ? (
                course.students.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={student.avatar} />
                        <AvatarFallback>{student.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-white font-medium">{student.name}</p>
                        <p className="text-gray-400 text-sm">{student.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-600">Student</Badge>
                      {canManagePeople && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            handleRemovePerson(student.id, student.name)
                          }
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No students enrolled yet.
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CoursePage;
