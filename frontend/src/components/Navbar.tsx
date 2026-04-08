"use client";

import { MapPin, Info, Users, Sparkles, HelpCircle, Calendar } from "lucide-react";
import { DefaultToggle } from "@/components/ThemeToggleDemo";
import { ExpandableTabs } from "@/components/ui/expandable-tabs";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function Navbar() {
  const router = useRouter();
  const navTabs = [
    { title: "How it works", icon: Info },
    { title: "About", icon: Users },
    { title: "Features", icon: Sparkles },
    { type: "separator" } as const,
    { title: "FAQ", icon: HelpCircle },
    { title: "Events", icon: Calendar },
  ];

  return (
    <nav className="h-[80px] flex items-center justify-between px-8 md:px-16 bg-[#F2F0EB] border-b border-[#E0DDD7] sticky top-0 z-50">
      {/* Logo */}
      <div className="font-display font-bold text-xl text-[#1A1A1A]">
        NexaCare<span className="text-[#C8A96E] italic">.ai</span>
      </div>

      {/* Center Links as ExpandableTabs */}
      <div className="hidden md:flex items-center">
        <ExpandableTabs 
          tabs={navTabs} 
          className="bg-transparent border-none shadow-none" 
          activeColor="text-[#C8A96E]" 
          onChange={(index) => {
            // MVP: route users to the working doctor dashboard when selecting any tab.
            if (index !== null) router.push("/login");
          }}
        />
      </div>

      {/* Right Content */}
      <div className="flex items-center gap-3">
        <DefaultToggle />
        <Link
          href="/patient-portal/login"
          className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-4 py-2.5 rounded-[6px] text-sm font-semibold hover:shadow-lg hover:shadow-teal-500/25 transition-all"
        >
          🏥 Patient Portal
        </Link>
        <Link
          href="/login"
          className="flex items-center gap-2 bg-transparent border-[1.5px] border-[#1A1A1A] text-[#1A1A1A] px-4 py-2.5 rounded-[6px] text-sm font-medium hover:bg-[#1A1A1A] hover:text-white transition-all"
        >
          Doctor Login
        </Link>
      </div>
    </nav>
  );
}
