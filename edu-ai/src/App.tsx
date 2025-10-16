import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import RootLayout from './components/layout/root-layout'
import DashboardLayout from './components/layout/dashboard-layout'
import LandingPage from './pages/landing-page'
import SignIn from './pages/signin-page'
import SignUp from './pages/signup-page'
import TeacherDashboard from './pages/dashboard-page'
// import Chatbot from './components/dashboard/chatbot'
import Course from './pages/course-page'

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes with root layout */}
        <Route path="/" element={<RootLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="signin" element={<SignIn />} />
          <Route path="signup" element={<SignUp />} />
        </Route>

        {/* Dashboard routes with dashboard layout */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<TeacherDashboard />} />
          {/* <Route path="chatbot" element={<Chatbot />} /> */}
          <Route path="course/:id" element={<Course />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App