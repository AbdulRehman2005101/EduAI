import { SignUp, useSignUp } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SignUpPage() {
  const { isLoaded, signUp } = useSignUp();
  const navigate = useNavigate();

  // Sync user with our database after successful signup
  useEffect(() => {
    const syncUserWithDB = async () => {
      if (signUp?.createdUserId && signUp?.emailAddress) {
        try {
          const response = await fetch('http://localhost:3000/api/users/sync-user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              clerkUserId: signUp.createdUserId,
              email: signUp.emailAddress,
              name: signUp.firstName || signUp.emailAddress.split('@')[0],
              avatar: null // Clerk doesn't provide imageUrl during signup
            })
          });

          if (!response.ok) {
            throw new Error('Failed to sync user with database');
          }

          console.log('User synced successfully with database');
        } catch (error) {
          console.error('Failed to sync user with database:', error);
          // Don't block the user flow if sync fails
        }
      }
    };

    if (signUp?.status === 'complete') {
      syncUserWithDB();
      navigate('/dashboard');
    }
  }, [signUp, navigate]);

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

          <SignUp 
            routing="path"
            path="/signup"
            redirectUrl="/dashboard"
            signInUrl="/signin"
          />

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