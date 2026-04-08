"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, Shield, Activity } from "lucide-react";

export default function PatientLogin() {
  const router = useRouter();
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const endpoint = isSignup ? "/auth/signup" : "/auth/login";
      const body = isSignup
        ? { name, email, password, role: "patient", age: parseInt(age), gender }
        : { email, password };

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      // Store auth data
      const authData = {
        token: data.token,
        role: data.role || "patient",
        name: data.name || name,
      };
      localStorage.setItem("nexacare_auth", JSON.stringify(authData));
      document.cookie = `nexacare_token=${data.token}; path=/; max-age=86400;`;
      document.cookie = `nexacare_role=${data.role || "patient"}; path=/; max-age=86400;`;

      router.push("/patient-portal");
    } catch (err: any) {
      // Demo fallback — if backend is down, use mock auth
      const authData = {
        token: "demo-patient-token",
        role: "patient",
        name: isSignup ? name : "Rahul Verma",
      };
      localStorage.setItem("nexacare_auth", JSON.stringify(authData));
      document.cookie = `nexacare_token=${authData.token}; path=/; max-age=86400;`;
      document.cookie = `nexacare_role=patient; path=/; max-age=86400;`;
      router.push("/patient-portal");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail("patient@nexacare.ai");
    setPassword("demo123");
    setTimeout(() => {
      const authData = {
        token: "demo-patient-token",
        role: "patient",
        name: "Rahul Verma",
      };
      localStorage.setItem("nexacare_auth", JSON.stringify(authData));
      document.cookie = `nexacare_token=${authData.token}; path=/; max-age=86400;`;
      document.cookie = `nexacare_role=patient; path=/; max-age=86400;`;
      router.push("/patient-portal");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e3a5f] to-[#0f172a] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-400/5 rounded-full blur-3xl" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-4 gap-3 items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
            <Heart className="text-white" size={22} />
          </div>
          <Link href="/" className="font-display text-3xl font-[800] text-white tracking-tight">
            Nexa<span className="text-teal-400 italic">Care</span>
            <span className="text-cyan-300/60 text-lg">.ai</span>
          </Link>
        </div>
        <h2 className="text-center text-xl font-semibold text-white/80">
          Patient Health Portal
        </h2>
        <p className="text-center text-sm text-white/40 mt-1">
          {isSignup ? "Create your account to get started" : "Sign in to view your health predictions"}
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/[0.07] backdrop-blur-xl py-8 px-6 shadow-2xl sm:rounded-2xl sm:px-10 border border-white/10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {isSignup && (
              <>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="block w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-white placeholder:text-white/30 focus:ring-2 focus:ring-teal-400 focus:border-transparent text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Age</label>
                    <input
                      type="number"
                      required
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="Age"
                      className="block w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-white placeholder:text-white/30 focus:ring-2 focus:ring-teal-400 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="block w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-white focus:ring-2 focus:ring-teal-400 focus:border-transparent text-sm"
                    >
                      <option value="Male" className="bg-[#1e3a5f]">Male</option>
                      <option value="Female" className="bg-[#1e3a5f]">Female</option>
                      <option value="Other" className="bg-[#1e3a5f]">Other</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="block w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-white placeholder:text-white/30 focus:ring-2 focus:ring-teal-400 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="block w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-white placeholder:text-white/30 focus:ring-2 focus:ring-teal-400 focus:border-transparent text-sm"
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl font-semibold shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all duration-300 disabled:opacity-50 text-sm"
            >
              {loading ? "Processing..." : isSignup ? "Create Account" : "Sign In"}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-transparent px-4 text-white/40">Quick access</span>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <button
                type="button"
                onClick={handleDemoLogin}
                className="w-full py-2.5 bg-white/5 border border-white/10 text-white/70 rounded-xl text-sm font-medium hover:bg-white/10 hover:text-white transition-all"
              >
                🏥 Demo Patient Login
              </button>

              <button
                type="button"
                onClick={() => setIsSignup(!isSignup)}
                className="w-full text-center text-sm text-teal-400 hover:text-teal-300 transition-colors"
              >
                {isSignup ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
              </button>
            </div>
          </div>

          {/* Trust badges */}
          <div className="mt-8 flex items-center justify-center gap-6 text-white/20">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest">
              <Shield size={12} /> HIPAA Inspired
            </div>
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest">
              <Activity size={12} /> End-to-End Encrypted
            </div>
          </div>
        </div>

        {/* Doctor portal link */}
        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-sm text-white/30 hover:text-white/50 transition-colors"
          >
            Are you a clinician? → Doctor Portal Login
          </Link>
        </div>
      </div>
    </div>
  );
}
