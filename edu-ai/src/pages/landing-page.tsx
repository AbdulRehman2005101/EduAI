import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#1B2023] text-white">
      {/* Navbar */}
      <header className="flex items-center justify-between px-8 py-6 border-b border-gray-800">
        <div className="flex items-center space-x-2">
          <img
            src="/images/eduai.png"
            alt="EduAI Logo"
            width={40}
            height={40}
          />
          <span className="text-xl font-bold">EduAI</span>
        </div>
        <nav className="hidden md:flex space-x-8 text-gray-300">
          <a href="#features" className="hover:text-[#42ACB0]">
            Features
          </a>
          <a href="#ai" className="hover:text-[#42ACB0]">
            AI Learning
          </a>
          <a href="#about" className="hover:text-[#42ACB0]">
            About
          </a>
        </nav>
        <div className="space-x-4">
          <Link to="/signin">
            <Button
              variant="outline"
              className="border-[#42ACB0] text-[#42ACB0] hover:bg-[#05636F]/20"
            >
              Sign In
            </Button>
          </Link>
          <Link to="/signup">
            <Button
              className="bg-gradient-to-r from-[#05636F] to-[#42ACB0] text-white hover:opacity-90"
            >
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between px-8 lg:px-20 py-16">
        <div className="space-y-6 max-w-lg">
          <h1 className="text-5xl font-bold leading-tight">
            Transform Learning with <span className="text-[#42ACB0]">AI</span>
          </h1>
          <p className="text-gray-400 text-lg">
            EduAI is your intelligent classroom. Organize courses, connect with
            classmates, and let AI help you understand complex concepts — all in
            one place.
          </p>
          <div className="space-x-4">
            <Link to="/signup">
              <Button className="bg-gradient-to-r from-[#05636F] to-[#42ACB0] text-white rounded-full px-6 h-12">
                Start Free
              </Button>
            </Link>
            <a href="#features">
              <Button
                variant="outline"
                className="border-[#42ACB0] text-[#42ACB0] hover:bg-[#05636F]/20 rounded-full px-6 h-12"
              >
                Learn More
              </Button>
            </a>
          </div>
        </div>
        <div className="mt-12 md:mt-0 relative">
          <img
            src="/images/hero.png"
            alt="Learning Illustration"
            width={500}
            height={500}
            className="drop-shadow-2xl"
          />
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="px-8 lg:px-20 py-20 grid gap-12 md:grid-cols-3"
      >
        <div className="bg-[#2A2F34] p-8 rounded-2xl shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-[#42ACB0]">
            Smart AI Assistant
          </h3>
          <p className="text-gray-400">
            Get instant explanations, summaries, and study help tailored to your
            course content.
          </p>
        </div>
        <div className="bg-[#2A2F34] p-8 rounded-2xl shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-[#42ACB0]">
            Organized Courses
          </h3>
          <p className="text-gray-400">
            Manage lectures, assignments, and discussions in one central hub.
          </p>
        </div>
        <div className="bg-[#2A2F34] p-8 rounded-2xl shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-[#42ACB0]">
            Collaborative Learning
          </h3>
          <p className="text-gray-400">
            Work with peers, share resources, and boost productivity together.
          </p>
        </div>
      </section>

      {/* AI Learning Section */}
      <section
        id="ai"
        className="px-8 lg:px-20 py-20 flex flex-col md:flex-row items-center gap-12"
      >
        <div className="flex-1">
          <img
            src="/images/hero2.jpg"
            alt="AI Learning"
            width={500}
            height={500}
          />
        </div>
        <div className="flex-1 space-y-6">
          <h2 className="text-4xl font-bold">
            AI That Understands Your Learning Style
          </h2>
          <p className="text-gray-400 text-lg">
            EduAI adapts to your progress and offers personalized learning paths,
            quizzes, and recommendations — like having your own private tutor.
          </p>
          <Link to="/signup">
            <Button className="bg-gradient-to-r from-[#05636F] to-[#42ACB0] text-white rounded-full px-6 h-12">
              Try EduAI Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 lg:px-20 py-10 border-t border-gray-800 text-gray-400 text-sm flex flex-col md:flex-row justify-between items-center">
        <span>© {new Date().getFullYear()} EduAI. All rights reserved.</span>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <a href="#" className="hover:text-[#42ACB0]">
            Privacy
          </a>
          <a href="#" className="hover:text-[#42ACB0]">
            Terms
          </a>
          <a href="#" className="hover:text-[#42ACB0]">
            Contact
          </a>
        </div>
      </footer>
    </div>
  )
}