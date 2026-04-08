"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, AlertTriangle, CheckCircle, ShieldAlert, Heart,
  Activity, Droplets, Sparkles, TrendingUp, Scale, Wind
} from "lucide-react";

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const data = localStorage.getItem("nexacare_last_prediction");
    if (data) {
      setResult(JSON.parse(data));
    }
  }, []);

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <ShieldAlert className="text-white/20 mb-4" size={64} />
        <h2 className="text-xl font-semibold text-white/60 mb-2">No Prediction Found</h2>
        <p className="text-white/30 text-sm mb-6">Complete the health assessment form first to see your results.</p>
        <Link
          href="/patient-portal"
          className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl font-semibold shadow-lg shadow-teal-500/20"
        >
          Take Assessment
        </Link>
      </div>
    );
  }

  const tierConfig: Record<string, { color: string; bg: string; border: string; icon: any; label: string }> = {
    Low: { color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20", icon: CheckCircle, label: "Low Risk" },
    Moderate: { color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", icon: AlertTriangle, label: "Moderate Risk" },
    High: { color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", icon: AlertTriangle, label: "High Risk" },
    "Very High": { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", icon: ShieldAlert, label: "Very High Risk" },
  };

  const tier = tierConfig[result.risk_tier] || tierConfig["Moderate"];
  const TierIcon = tier.icon;

  const iconMap: Record<string, any> = {
    heart: Heart, activity: Activity, droplet: Droplets, droplets: Droplets,
    wind: Wind, scale: Scale, stethoscope: Activity, moon: Sparkles,
    footprints: TrendingUp, "glass-water": Droplets,
  };

  // Get SHAP values for visualization
  const shapEntries = result.shap_values
    ? Object.entries(result.shap_values as Record<string, number>)
        .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a))
        .slice(0, 6)
    : [];

  const maxShap = shapEntries.length > 0 ? Math.max(...shapEntries.map(([, v]) => Math.abs(v))) : 1;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      <Link
        href="/patient-portal"
        className="inline-flex items-center text-sm text-white/30 hover:text-white/60 transition-colors"
      >
        <ArrowLeft size={16} className="mr-2" /> Back to Health Check
      </Link>

      {/* Risk Score Hero */}
      <div className={`${tier.bg} border ${tier.border} rounded-2xl p-8 backdrop-blur-sm`}>
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Score Circle */}
          <div className="relative w-40 h-40 shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
              <circle
                className="text-white/5"
                strokeWidth="8"
                stroke="currentColor"
                fill="none"
                cx="60" cy="60" r="52"
              />
              <circle
                className={tier.color}
                strokeDasharray={`${(result.risk_score / 100) * 326.73}, 326.73`}
                strokeWidth="8"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                cx="60" cy="60" r="52"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className={`text-4xl font-display font-bold ${tier.color}`}>
                {result.risk_score}
              </div>
              <div className="text-xs text-white/40 font-semibold uppercase tracking-widest">
                / 100
              </div>
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
              <TierIcon className={tier.color} size={24} />
              <span className={`text-2xl font-display font-bold ${tier.color}`}>
                {tier.label}
              </span>
            </div>
            <p className="text-white/40 text-sm mb-4">
              Model confidence: {result.confidence}%
            </p>

            {/* Disease badges */}
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {result.diseases?.map((d: string, i: number) => (
                <span
                  key={i}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    d === "Diabetes" ? "bg-purple-500/15 text-purple-400 border border-purple-500/20" :
                    d === "Heart Disease" ? "bg-red-500/15 text-red-400 border border-red-500/20" :
                    d === "Hypertension" ? "bg-blue-500/15 text-blue-400 border border-blue-500/20" :
                    "bg-teal-500/15 text-teal-400 border border-teal-500/20"
                  }`}
                >
                  {d}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Factors */}
      <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
        <h2 className="text-sm font-bold text-white/60 uppercase tracking-widest mb-5 flex items-center gap-2">
          <TrendingUp size={16} className="text-teal-400" /> Top Contributing Factors
        </h2>
        <div className="space-y-4">
          {result.top_factors?.map((factor: string, i: number) => (
            <div key={i} className="flex items-start gap-4 p-4 bg-white/[0.03] rounded-xl border border-white/5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${
                i === 0 ? "bg-red-500/20 text-red-400" :
                i === 1 ? "bg-orange-500/20 text-orange-400" :
                "bg-yellow-500/20 text-yellow-400"
              }`}>
                #{i + 1}
              </div>
              <p className="text-white/70 text-sm leading-relaxed">{factor}</p>
            </div>
          ))}
        </div>
      </div>

      {/* SHAP Values Visualization */}
      {shapEntries.length > 0 && (
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
          <h2 className="text-sm font-bold text-white/60 uppercase tracking-widest mb-5 flex items-center gap-2">
            <Activity size={16} className="text-cyan-400" /> Feature Importance (SHAP Analysis)
          </h2>
          <div className="space-y-3">
            {shapEntries.map(([feature, value]) => {
              const numValue = Number(value);
              const barWidth = (Math.abs(numValue) / maxShap) * 100;
              const isPositive = numValue > 0;
              return (
                <div key={feature} className="flex items-center gap-4">
                  <div className="w-36 text-sm text-white/50 text-right shrink-0">{feature}</div>
                  <div className="flex-1 h-7 bg-white/5 rounded-lg overflow-hidden relative">
                    <div
                      className={`h-full rounded-lg transition-all duration-700 ${
                        isPositive ? "bg-gradient-to-r from-red-500/40 to-red-500/60" : "bg-gradient-to-r from-teal-500/40 to-teal-500/60"
                      }`}
                      style={{ width: `${Math.max(barWidth, 4)}%` }}
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-white/40 font-mono">
                      {isPositive ? "+" : ""}{numValue.toFixed(3)}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider w-20 ${isPositive ? "text-red-400" : "text-teal-400"}`}>
                    {isPositive ? "↑ Risk" : "↓ Protective"}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-white/20 text-[11px] mt-4">
            Red bars indicate factors increasing risk. Green bars show protective factors.
          </p>
        </div>
      )}

      {/* Disease Risk Breakdown */}
      {result.disease_risks && result.disease_risks.length > 0 && (
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
          <h2 className="text-sm font-bold text-white/60 uppercase tracking-widest mb-5 flex items-center gap-2">
            <ShieldAlert size={16} className="text-orange-400" /> Disease Risk Breakdown
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {result.disease_risks.map((dr: any, i: number) => {
              const prob = Math.round(dr.probability * 100);
              return (
                <div key={i} className="bg-white/[0.03] rounded-xl p-5 border border-white/5 text-center">
                  <div className="text-sm font-semibold text-white/50 mb-3">{dr.disease}</div>
                  <div className="relative w-20 h-20 mx-auto mb-3">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 44 44">
                      <circle className="text-white/5" strokeWidth="4" stroke="currentColor" fill="none" cx="22" cy="22" r="18" />
                      <circle
                        className={prob > 50 ? "text-red-400" : prob > 25 ? "text-yellow-400" : "text-teal-400"}
                        strokeDasharray={`${(prob / 100) * 113.1}, 113.1`}
                        strokeWidth="4" strokeLinecap="round" stroke="currentColor" fill="none"
                        cx="22" cy="22" r="18"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold text-white/80">{prob}%</span>
                    </div>
                  </div>
                  <div className="text-[10px] text-white/30">Confidence: {dr.confidence}%</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
        <h2 className="text-sm font-bold text-white/60 uppercase tracking-widest mb-5 flex items-center gap-2">
          <Sparkles size={16} className="text-teal-400" /> Personalized Recommendations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {result.recommendations?.map((rec: any, i: number) => {
            const title = typeof rec === "string" ? `Recommendation ${i + 1}` : rec.title;
            const desc = typeof rec === "string" ? rec : rec.description;
            const urgency = typeof rec === "string" ? "moderate" : rec.urgency;
            const iconName = typeof rec === "string" ? "heart" : rec.icon;
            const RecIcon = iconMap[iconName] || Heart;

            return (
              <div
                key={i}
                className={`relative p-5 rounded-xl border transition-all hover:scale-[1.02] ${
                  urgency === "high"
                    ? "bg-red-500/5 border-red-500/15"
                    : urgency === "moderate"
                    ? "bg-yellow-500/5 border-yellow-500/15"
                    : "bg-teal-500/5 border-teal-500/15"
                }`}
              >
                {urgency === "high" && (
                  <span className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-wider text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
                    Urgent
                  </span>
                )}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
                  urgency === "high" ? "bg-red-500/20 text-red-400" :
                  urgency === "moderate" ? "bg-yellow-500/20 text-yellow-400" :
                  "bg-teal-500/20 text-teal-400"
                }`}>
                  <RecIcon size={20} />
                </div>
                <h3 className="text-sm font-semibold text-white/80 mb-2">{title}</h3>
                <p className="text-xs text-white/40 leading-relaxed">{desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/patient-portal"
          className="flex-1 py-3.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl font-semibold text-center shadow-lg shadow-teal-500/20"
        >
          Take Another Assessment
        </Link>
        <Link
          href="/patient-portal/history"
          className="flex-1 py-3.5 bg-white/5 border border-white/10 text-white/60 rounded-xl font-semibold text-center hover:bg-white/10 hover:text-white/80 transition-all"
        >
          View History
        </Link>
      </div>

      <p className="text-center text-white/15 text-xs">
        Disclaimer: This is an AI-powered risk estimate for educational purposes only.
        Always consult a qualified healthcare professional for medical advice.
      </p>
    </div>
  );
}
