import { useAuth } from "@/context/auth-context";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "STUDENT",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // Store the token in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      console.log("Registration successful:", data);
      // Also update React state via AuthContext
      login(data.token, data.user);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#1B2023" }}>
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="/images/sign-in-img.png"
          alt="Abstract network pattern"
          className="h-[42rem] w-auto"
        />
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-right">
            <img
              src="/images/eduai.png"
              alt="Logo"
              width={150}
              height={150}
              className="mx-auto mb-4"
            />
          </div>

          <div className="space-y-2">
            <h2 className="text-white text-4xl font-bold text-balance">
              Create Account
            </h2>
            <p className="text-gray-400 text-lg">
              Join us to explore all the features
            </p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-white text-sm font-medium">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-transparent border border-gray-600 text-white placeholder-gray-500 focus:border-[#42ACB0] h-12 px-4 rounded-lg focus:outline-none"
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-white text-sm font-medium">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-transparent border border-gray-600 text-white placeholder-gray-500 focus:border-[#42ACB0] h-12 px-4 rounded-lg focus:outline-none"
                placeholder="Enter your email"
              />
            </div>

            <div className="space-y-2">
              <label className="text-white text-sm font-medium">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full bg-transparent border border-gray-600 text-white placeholder-gray-500 focus:border-[#42ACB0] h-12 px-4 rounded-lg focus:outline-none"
                placeholder="Enter your password"
              />
            </div>

            <div className="space-y-2">
              <label className="text-white text-sm font-medium">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full bg-transparent border border-gray-600 text-white h-12 px-4 rounded-lg focus:outline-none focus:border-[#42ACB0]"
              >
                <option value="STUDENT" className="bg-gray-800">
                  Student
                </option>
                <option value="TEACHER" className="bg-gray-800">
                  Teacher
                </option>
                <option value="TA" className="bg-gray-800">
                  Teaching Assistant
                </option>
              </select>
            </div>

            {error && (
              <div className="p-3 bg-red-600/20 border border-red-600 text-red-300 rounded-lg">
                <p className="text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-white font-medium rounded-lg transition-all hover:opacity-90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg, #05636F 0%, #42ACB0 100%)",
              }}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="text-center pt-4">
            <span className="text-gray-400 text-sm">
              Already have an account?{" "}
              <Link
                to="/signin"
                className="text-[#42ACB0] hover:text-[#05636F] transition-colors"
              >
                Sign in
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
