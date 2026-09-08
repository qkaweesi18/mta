"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import SocialAuthButtons from "../components/SocialAuthButtons";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      localStorage.setItem("token", data.token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="max-w-md w-full space-y-8 bg-black/50 backdrop-blur-md p-10 border border-white/10 relative z-10">
        <div>
          <h2 className="mt-6 text-center text-[40px] leading-[0.9] font-black tracking-tighter uppercase italic text-white flex flex-col">
            <span>SIGN IN</span>
            <span className="text-transparent" style={{ WebkitTextStroke: "1px white" }}>ACCOUNT</span>
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-gray-500 mb-2">Email address</label>
              <input
                type="email"
                required
                className="appearance-none relative block w-full px-4 py-3 bg-white/5 border border-white/10 placeholder-gray-600 text-white focus:outline-none focus:ring-1 focus:ring-white focus:border-white focus:z-10 sm:text-sm transition-colors"
                placeholder="EMAIL ADDRESS"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-gray-500 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="appearance-none relative block w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 placeholder-gray-600 text-white focus:outline-none focus:ring-1 focus:ring-white focus:border-white focus:z-10 sm:text-sm transition-colors"
                  placeholder="PASSWORD"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute inset-y-0 right-0 z-10 flex items-center px-4 text-white hover:text-gray-300 focus:outline-none focus:ring-1 focus:ring-white"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" strokeWidth={2.5} aria-hidden="true" /> : <Eye className="h-5 w-5" strokeWidth={2.5} aria-hidden="true" />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-4 px-4 text-xs font-black tracking-widest uppercase text-black bg-white skew-x-[-12deg] hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-70 transition-colors"
            >
              <span className="skew-x-[12deg] flex items-center">
                {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "SIGN IN"}
              </span>
            </button>
          </div>

          <SocialAuthButtons />
          
          <div className="text-center mt-6 text-xs font-bold tracking-widest uppercase text-gray-500">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-white hover:text-gray-300 underline underline-offset-4 decoration-1 transition-colors">
              Register here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
