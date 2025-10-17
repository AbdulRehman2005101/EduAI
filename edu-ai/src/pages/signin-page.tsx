import { useAuth } from "@/context/auth-context";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function SignInPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
const { login } = useAuth()
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store the token and user data in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      // Also update React state via AuthContext
login(data.token, data.user);
      console.log('Login successful:', data);
      navigate('/dashboard');
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
              Welcome Back!
            </h2>
            <p className="text-gray-400 text-lg">
              Let&apos;s explore with Plungerlift for discover all it&apos;s,
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-white text-sm font-medium">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-transparent border border-gray-600 text-white placeholder-gray-500 focus:border-[#42ACB0] h-12 px-4 rounded-lg focus:outline-none transition-colors"
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
                className="w-full bg-transparent border border-gray-600 text-white placeholder-gray-500 focus:border-[#42ACB0] h-12 px-4 rounded-lg focus:outline-none transition-colors"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-600/20 border border-red-600 text-red-300 rounded-lg">
                <p className="text-sm font-medium">Error</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            )}

            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-[#42ACB0] hover:text-[#05636F] text-sm transition-colors"
              >
                Forgot your password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-white font-medium rounded-lg transition-all hover:opacity-90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg, #05636F 0%, #42ACB0 100%)",
              }}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="text-center pt-4">
            <span className="text-gray-400 text-sm">
              Don&apos;t have an account yet?{" "}
              <Link
                to="/signup"
                className="text-[#42ACB0] hover:text-[#05636F] transition-colors"
              >
                Create an account
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}