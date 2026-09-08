"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Eye, EyeOff, Loader2 } from "lucide-react";
import SocialAuthButtons from "../components/SocialAuthButtons";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const passwordRequirements = [
    { label: "12 or more characters", met: password.length >= 12 },
    { label: "An uppercase letter", met: /[A-Z]/.test(password) },
    { label: "A lowercase letter", met: /[a-z]/.test(password) },
    { label: "A number", met: /[0-9]/.test(password) },
    { label: "A symbol", met: /[^A-Za-z0-9]/.test(password) },
  ];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, confirmEmail, password, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
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
            <span>REGISTER</span>
            <span className="text-transparent" style={{ WebkitTextStroke: "1px white" }}>ACCOUNT</span>
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
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
              <label className="block text-xs font-bold tracking-widest uppercase text-gray-500 mb-2">Confirm email address</label>
              <input
                type="email"
                required
                className="appearance-none relative block w-full px-4 py-3 bg-white/5 border border-white/10 placeholder-gray-600 text-white focus:outline-none focus:ring-1 focus:ring-white focus:border-white focus:z-10 sm:text-sm transition-colors"
                placeholder="CONFIRM EMAIL ADDRESS"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-gray-500 mb-2">
                Password
              </label>
              <div className="mb-3 border border-white/10 bg-white/5 p-3 text-[10px] uppercase tracking-wider text-gray-400">
                Required: 12+ characters, uppercase letter, lowercase letter, number, and symbol.
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={12}
                  pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{12,}"
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
              <ul className="mt-3 space-y-1.5" aria-label="Password requirements">
                {passwordRequirements.map((requirement) => (
                  <li
                    key={requirement.label}
                    className={`flex items-center gap-2 text-[10px] uppercase tracking-wider ${
                      requirement.met ? "text-green-400" : "text-gray-500"
                    }`}
                  >
                    <span
                      className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                        requirement.met
                          ? "border-green-400 bg-green-400 text-black"
                          : "border-gray-600"
                      }`}
                    >
                      {requirement.met && <Check className="h-3 w-3" aria-hidden="true" />}
                    </span>
                    {requirement.label}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-gray-500 mb-2">Confirm password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  minLength={12}
                  pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{12,}"
                  className="appearance-none relative block w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 placeholder-gray-600 text-white focus:outline-none focus:ring-1 focus:ring-white focus:border-white focus:z-10 sm:text-sm transition-colors"
                  placeholder="CONFIRM PASSWORD"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((visible) => !visible)}
                  className="absolute inset-y-0 right-0 z-10 flex items-center px-4 text-white hover:text-gray-300 focus:outline-none focus:ring-1 focus:ring-white"
                  aria-label={showConfirmPassword ? "Hide confirmed password" : "Show confirmed password"}
                  title={showConfirmPassword ? "Hide confirmed password" : "Show confirmed password"}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" strokeWidth={2.5} aria-hidden="true" /> : <Eye className="h-5 w-5" strokeWidth={2.5} aria-hidden="true" />}
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
                {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "SIGN UP"}
              </span>
            </button>
          </div>

          <SocialAuthButtons />
          
          <div className="text-center mt-6 text-xs font-bold tracking-widest uppercase text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-white hover:text-gray-300 underline underline-offset-4 decoration-1 transition-colors">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
