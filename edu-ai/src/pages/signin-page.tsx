import { SignIn, useUser } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";

export default function SignInPage() {
  const { user } = useUser();

  // Optional: Sync user on signin as well (in case webhook failed)
  useEffect(() => {
    const syncUserIfNeeded = async () => {
      if (user) {
        try {
          await fetch('http://localhost:3000/api/users/sync-user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              clerkUserId: user.id,
              email: user.primaryEmailAddress?.emailAddress,
              name: user.fullName || user.primaryEmailAddress?.emailAddress.split('@')[0],
              avatar: user.imageUrl // This exists on the User object
            })
          });
        } catch (error) {
          console.error('Failed to sync user on signin:', error);
        }
      }
    };

    syncUserIfNeeded();
  }, [user]);

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

          <SignIn 
            routing="path"
            path="/signin"
            redirectUrl="/dashboard"
            signUpUrl="/signup"
          />

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