"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Heart, ClipboardList, BarChart3, History, LogOut, Home } from "lucide-react";

export default function PatientPortalLayout({ children }: { children: React.ReactNode }) {
  const [userName, setUserName] = useState("Patient");
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
    const authData = localStorage.getItem("nexacare_auth");
    if (authData) {
      const parsed = JSON.parse(authData);
      setUserName(parsed.name || "Patient");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("nexacare_auth");
    document.cookie = "nexacare_token=; path=/; max-age=0;";
    document.cookie = "nexacare_role=; path=/; max-age=0;";
    router.push("/patient-portal/login");
  };

  if (!isMounted) return null;

  const navItems = [
    { name: "Health Check", href: "/patient-portal", icon: ClipboardList },
    { name: "My Results", href: "/patient-portal/results", icon: BarChart3 },
    { name: "History", href: "/patient-portal/history", icon: History },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
      {/* Sidebar */}
      <div className="flex flex-col w-64 h-full bg-white/[0.03] border-r border-white/5 shrink-0 backdrop-blur-sm">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Heart className="text-white" size={18} />
            </div>
            <div>
              <div className="font-display font-bold text-lg text-white tracking-tight">
                Nexa<span className="text-teal-400 italic">Care</span>
              </div>
              <div className="text-[10px] uppercase tracking-widest text-white/30 font-semibold">
                Patient Portal
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-teal-500/20 to-cyan-500/10 text-teal-400 border border-teal-500/20 shadow-lg shadow-teal-500/5"
                    : "text-white/40 hover:text-white/70 hover:bg-white/5"
                }`}
              >
                <item.icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="p-4 border-t border-white/5 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/30 hover:text-white/50 hover:bg-white/5 transition-all"
          >
            <Home size={16} /> Back to Home
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/30 hover:text-red-400 hover:bg-red-500/5 transition-all w-full"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="h-16 flex items-center justify-between px-8 bg-white/[0.02] border-b border-white/5 shrink-0 backdrop-blur-sm">
          <div className="text-sm text-white/40">
            Welcome back, <span className="text-white font-medium">{userName}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
              PATIENT
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
