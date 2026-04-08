import { Linkedin, Twitter, User, Stethoscope } from "lucide-react";
import Image from "next/image";
import { GooeyTextDemo } from "@/components/GooeyTextDemo";
import Link from "next/link";

export function Hero() {
  return (
    <section className="bg-[#F2F0EB] relative pt-20 pb-24 overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-8 md:px-16 grid grid-cols-1 lg:grid-cols-[55%_45%] gap-12 items-center relative">
        
        {/* Left Column */}
        <div className="z-10 mt-10 lg:mt-0">
          <div className="uppercase text-[12px] font-semibold text-[#9B9B9B] tracking-[0.12em] mb-6">
            AI-Powered Healthcare
          </div>
          
          <GooeyTextDemo />
          <h1 className="font-display text-[64px] lg:text-[72px] font-[800] text-[#1A1A1A] leading-[1.0] mb-8">
            Predict Patient Risk <br />
            <span className="text-[#C8A96E] italic">Before It's Too Late</span>
          </h1>
          
          <p className="text-[15px] font-sans text-[#6B6B6B] leading-[1.7] max-w-lg mb-10">
            Identify high-risk patients 6–48 hours before deterioration — giving clinicians the window to act.
          </p>
          
          {/* CTA Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16 max-w-xl">
            <Link
              href="/login?role=clinician"
              className="flex flex-col items-start p-5 rounded-xl border-2 border-[#1A1A1A] bg-[#1A1A1A] text-white hover:bg-[#333333] transition-colors group"
            >
              <div className="flex items-center gap-2 font-display font-bold text-[16px] mb-1">
                <Stethoscope size={18} className="text-[#C8A96E]" />
                Login as Clinician
              </div>
              <p className="text-white/70 text-[13px] leading-snug">Access the predictive patient monitoring dashboard</p>
            </Link>
            
            <Link
              href="/patient-portal/login"
              className="flex flex-col items-start p-5 rounded-xl border-2 border-[#0F766E] bg-teal-50 text-[#1A1A1A] hover:bg-[#0F766E] hover:text-white transition-colors group"
            >
              <div className="flex items-center gap-2 font-display font-bold text-[16px] mb-1">
                <User size={18} className="text-[#0F766E] group-hover:text-white transition-colors" />
                Login as Patient
              </div>
              <p className="text-[#6B6B6B] group-hover:text-white/80 text-[13px] leading-snug transition-colors">Access your health dashboard & predictions</p>
            </Link>
          </div>
          
          {/* Stats Below */}
          <div className="flex flex-wrap gap-10 border-t border-[#E0DDD7] pt-8">
            <div>
              <div className="font-display text-4xl font-[800] text-[#1A1A1A]">6-48 hrs</div>
              <div className="text-[13px] text-[#6B6B6B] mt-1">early warning window</div>
            </div>
            <div>
              <div className="font-display text-4xl font-[800] text-[#1A1A1A]">30%</div>
              <div className="text-[13px] text-[#6B6B6B] mt-1">fewer ICU escalations</div>
            </div>
            <div>
              <div className="font-display text-4xl font-[800] text-[#1A1A1A]">95%</div>
              <div className="text-[13px] text-[#6B6B6B] mt-1">prediction accuracy</div>
            </div>
          </div>
        </div>

        {/* Right Column - Photo & Floating Card */}
        <div className="relative mt-10 lg:mt-0 px-4 lg:px-0">
          <div className="rounded-2xl overflow-hidden aspect-[4/5] bg-[#E8E5DF] relative shadow-2xl group">
            <img 
              src="/images/hero.jpg" 
              alt="Medical team analyzing patient data"
              className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
            />
          </div>

          {/* Floating Glassmorphic UI */}
          <div className="absolute -bottom-6 -left-12 bg-white/40 backdrop-blur-xl border border-white/40 p-6 rounded-xl shadow-2xl max-w-xs hidden lg:block">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold uppercase tracking-tighter text-[#1A1A1A] opacity-70">Patient Risk Score</span>
              <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">CRITICAL</span>
            </div>
            <div className="h-24 w-full flex items-end gap-1 mb-4">
              <div className="flex-1 bg-[#1A1A1A]/20 h-[30%] rounded-t-sm"></div>
              <div className="flex-1 bg-[#1A1A1A]/20 h-[45%] rounded-t-sm"></div>
              <div className="flex-1 bg-[#1A1A1A]/20 h-[40%] rounded-t-sm"></div>
              <div className="flex-1 bg-[#C8A96E] h-[70%] rounded-t-sm"></div>
              <div className="flex-1 bg-[#C8A96E] h-[90%] rounded-t-sm"></div>
              <div className="flex-1 bg-[#1A1A1A] h-[85%] rounded-t-sm"></div>
            </div>
            <p className="text-xs leading-snug text-[#1A1A1A] font-medium opacity-80">Sepsis probability increased by 24% in the last 2 hours. Notification sent to floor 4.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
