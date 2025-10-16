import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
import { useUser } from "@clerk/clerk-react";
import DashboardHeader from "../components/shared/header";
import {
  PlusCircle,
  BookOpen,
  Users,
  Calendar,
  Settings,
  Eye,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Course {
  id: string;
  name: string;
  description: string;
  classCode?: string;
  teacherId?: string;
  teacher?: {
    name: string;
    email: string;
  };
  assignments?: Array<{
    id: string;
    title: string;
    dueDate: string;
  }>;
  announcements?: Array<{
    id: string;
    title: string;
    date: string;
  }>;
}

const DashboardCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [addingCourse, setAddingCourse] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newCourse, setNewCourse] = useState({ title: "", description: "" });
  const { user } = useUser();
  const [classCode, setClassCode] = useState("");
  const [loadingClassCode, setLoadingClassCode] = useState(false);
  const [errorClassCode, setErrorClassCode] = useState("");
  const [openClassCode, setOpenClassCode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      if (!user?.primaryEmailAddress?.emailAddress) return;

      setLoading(true);
      setError(null);

      try {
        // Determine endpoint based on user role
        let endpoint = "";
        if (user.publicMetadata?.role === "TEACHER") {
          endpoint = "http://localhost:3000/api/courses/teacher";
        } else {
          endpoint = "http://localhost:3000/api/courses/student";
        }

        const response = await fetch(`${endpoint}?email=${user.primaryEmailAddress.emailAddress}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }

        const data = await response.json();
        console.log("Fetched courses:", data);
        setCourses(data.courses || []);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setError("Failed to fetch courses. Please try again.");
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [user]);

  // Handle course add
  const handleAddCourse = async () => {
    if (!newCourse.title.trim() || !newCourse.description.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setAddingCourse(true);
    try {
      setError(null);
      const response = await fetch("http://localhost:3000/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newCourse.title.trim(),
          description: newCourse.description.trim(),
          teacherEmail: user?.primaryEmailAddress?.emailAddress,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add course");
      }

      const data = await response.json();
      console.log("Added course response:", data);

      const newCourseData: Course = {
        id: data.course?.id || data.id,
        name: data.course?.name || data.name || newCourse.title.trim(),
        description: data.course?.description || data.description || newCourse.description.trim(),
        teacherId: data.course?.teacherId || data.teacherId,
        teacher: data.course?.teacher || data.teacher,
        assignments: data.course?.assignments || [],
        announcements: data.course?.announcements || [],
      };

      setCourses((prev) => [...prev, newCourseData]);
      setNewCourse({ title: "", description: "" });
      setOpen(false);
    } catch (err: any) {
      console.error("Error adding course:", err);
      setError(err.message || "Failed to add course. Please try again.");
    } finally {
      setAddingCourse(false);
    }
  };

  const handleJoinCourse = async () => {
    if (!classCode.trim()) {
      setErrorClassCode("Please enter a class code");
      return;
    }

    setLoadingClassCode(true);
    setErrorClassCode("");

    try {
      const response = await fetch("http://localhost:3000/api/courses/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classCode: classCode.trim().toLowerCase(),
          studentEmail: user?.primaryEmailAddress?.emailAddress,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCourses(prev => [...prev, data.course]);
        setClassCode("");
        setOpenClassCode(false);
      } else {
        setErrorClassCode(data.error || "Failed to join course");
      }
    } catch (err) {
      setErrorClassCode("Network error. Please try again.");
    } finally {
      setLoadingClassCode(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex-1 min-h-screen w-full p-6 bg-gradient-to-br from-[#1B2023] to-[#2A2F35]">
        <DashboardHeader title="Educative Optimization" subtitle="My Courses" />
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="text-white text-lg">Loading courses...</p>
          </div>
        </div>
      </div>
    );
  }

  const userRole = user?.publicMetadata?.role as string || "STUDENT";
  const isTeacher = userRole === "TEACHER";

  return (
    <div className="flex-1 min-h-screen w-full p-6 bg-gradient-to-br from-[#1B2023] to-[#2A2F35]">
      <DashboardHeader title="Educative Optimization" subtitle="My Courses" />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Courses</p>
              <p className="text-3xl font-bold">{courses.length}</p>
            </div>
            <BookOpen className="h-12 w-12 text-blue-200" />
          </div>
        </div>

        {isTeacher && (
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 rounded-xl text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">
                  Active Courses
                </p>
                <p className="text-3xl font-bold">{courses.length}</p>
              </div>
              <Users className="h-12 w-12 text-green-200" />
            </div>
          </div>
        )}

        <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">This Week</p>
              <p className="text-3xl font-bold">
                {courses.reduce(
                  (acc, course) => acc + (course.assignments?.length || 0),
                  0
                )}
              </p>
            </div>
            <Calendar className="h-12 w-12 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="mb-6 p-4 bg-red-600/20 border border-red-600 text-red-300 rounded-lg">
          <p className="font-medium">Error</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Add Course Button - Only for Teachers */}
      {isTeacher ? (
        <div className="mb-8">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium px-6 py-3 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105">
                <PlusCircle className="h-5 w-5 mr-2" />
                Add New Course
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-gray-800 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white text-xl font-bold">
                  Add a New Course
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Course Title
                  </label>
                  <Input
                    placeholder="Enter course title"
                    value={newCourse.title}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, title: e.target.value })
                    }
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Course Description
                  </label>
                  <Textarea
                    placeholder="Enter course description"
                    value={newCourse.description}
                    onChange={(e) =>
                      setNewCourse({
                        ...newCourse,
                        description: e.target.value,
                      })
                    }
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 min-h-[100px]"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddCourse}
                  disabled={
                    !newCourse.title.trim() ||
                    !newCourse.description.trim() ||
                    addingCourse
                  }
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {addingCourse ? "Creating..." : "Create Course"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <div className="mb-8">
          <Dialog open={openClassCode} onOpenChange={setOpenClassCode}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white">
                Join Course
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">Join a Course</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300">Class Code</label>
                  <Input
                    placeholder="Enter class code (e.g., abc123d)"
                    value={classCode}
                    onChange={(e) => setClassCode(e.target.value)}
                    maxLength={7}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                {errorClassCode && (
                  <p className="text-red-500 text-sm">{errorClassCode}</p>
                )}
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setOpenClassCode(false)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleJoinCourse} 
                  disabled={loadingClassCode}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {loadingClassCode ? "Joining..." : "Join"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Courses List */}
      <div className="space-y-6">
        {courses.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              {isTeacher
                ? "No courses created yet"
                : "No courses enrolled yet"}
            </h3>
            <p className="text-gray-500 mb-6">
              {isTeacher
                ? "Create your first course to get started with teaching!"
                : "Enroll in courses to begin your learning journey!"}
            </p>
            {isTeacher && (
              <Button
                onClick={() => setOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Your First Course
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-xl text-white mb-2 line-clamp-2">
                      {course.name || "Untitled Course"}
                    </h3>
                    <p className="text-gray-400 text-sm line-clamp-3 mb-4">
                      {course.description || "No description available"}
                    </p>
                  </div>
                </div>

                {/* Course Stats */}
                <div className="flex justify-between items-center mb-6">
                  <div className="flex space-x-4 text-sm">
                    <span className="text-blue-400 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {course.assignments?.length || 0} assignments
                    </span>
                    <span className="text-green-400 flex items-center">
                      <BookOpen className="h-4 w-4 mr-1" />
                      {course.announcements?.length || 0} announcements
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                    onClick={() => navigate(`/dashboard/course/${course.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  {isTeacher && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Manage
                    </Button>
                  )}
                </div>

                {/* Teacher Info for non-teachers */}
                {!isTeacher && course.teacher && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <p className="text-xs text-gray-500">
                      Instructor:{" "}
                      <span className="text-gray-400">
                        {course.teacher.name}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardCourses;