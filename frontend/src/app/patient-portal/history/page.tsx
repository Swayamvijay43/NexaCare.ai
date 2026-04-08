"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { History, AlertTriangle, CheckCircle, ShieldAlert, Calendar, ArrowRight, Loader2 } from "lucide-react";

interface HistoryRecord {
  id: string;
  input_data: any;
  prediction_result: any;
  createdAt: string;
}

export default function HistoryPage() {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const authData = localStorage.getItem("nexacare_auth");
        const token = authData ? JSON.parse(authData).token : "";

        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const res = await fetch(`${API_URL}/patient-portal/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setRecords(data);
        } else {
          // Load from local storage as fallback
          loadLocalHistory();
        }
      } catch {
        loadLocalHistory();
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const loadLocalHistory = () => {
    // Reconstruct from locally stored predictions
    const lastPrediction = localStorage.getItem("nexacare_last_prediction");
    if (lastPrediction) {
      const pred = JSON.parse(lastPrediction);
      setRecords([
        {
          id: "local-1",
          input_data: {},
          prediction_result: pred,
          createdAt: new Date().toISOString(),
        },
      ]);
    }
  };

  const tierColors: Record<string, { color: string; bg: string; icon: any }> = {
    Low: { color: "text-green-400", bg: "bg-green-500/10", icon: CheckCircle },
    Moderate: { color: "text-yellow-400", bg: "bg-yellow-500/10", icon: AlertTriangle },
    High: { color: "text-orange-400", bg: "bg-orange-500/10", icon: AlertTriangle },
    "Very High": { color: "text-red-400", bg: "bg-red-500/10", icon: ShieldAlert },
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin text-teal-400 mb-4" size={40} />
        <p className="text-white/40 text-sm">Loading your health history...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3">
          <History className="text-teal-400" size={24} />
          Prediction History
        </h1>
        <p className="text-white/40 text-sm mt-1">
          View your past health risk assessments and track changes over time.
        </p>
      </div>

      {records.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white/[0.03] rounded-2xl border border-white/10">
          <History className="text-white/10 mb-4" size={56} />
          <h3 className="text-lg font-semibold text-white/50 mb-2">No History Yet</h3>
          <p className="text-white/30 text-sm mb-6">Complete your first health assessment to see it here.</p>
          <Link
            href="/patient-portal"
            className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl font-semibold shadow-lg shadow-teal-500/20"
          >
            Take Assessment
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((record) => {
            const pred = record.prediction_result;
            const tier = tierColors[pred?.risk_tier] || tierColors["Moderate"];
            const TierIcon = tier.icon;
            const date = new Date(record.createdAt);

            return (
              <div
                key={record.id}
                className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 backdrop-blur-sm hover:bg-white/[0.06] transition-all cursor-pointer"
                onClick={() => {
                  localStorage.setItem("nexacare_last_prediction", JSON.stringify(pred));
                  window.location.href = "/patient-portal/results";
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Score */}
                    <div className={`relative w-16 h-16 shrink-0`}>
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 44 44">
                        <circle className="text-white/5" strokeWidth="3" stroke="currentColor" fill="none" cx="22" cy="22" r="18" />
                        <circle
                          className={tier.color}
                          strokeDasharray={`${((pred?.risk_score || 0) / 100) * 113.1}, 113.1`}
                          strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none"
                          cx="22" cy="22" r="18"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-lg font-bold ${tier.color}`}>{pred?.risk_score || 0}</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <TierIcon className={tier.color} size={16} />
                        <span className={`font-semibold ${tier.color}`}>{pred?.risk_tier || "Unknown"} Risk</span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {pred?.diseases?.map((d: string, i: number) => (
                          <span key={i} className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/10">
                            {d}
                          </span>
                        ))}
                      </div>
                      <div className="text-xs text-white/20 mt-1.5 flex items-center gap-1.5">
                        <Calendar size={12} />
                        {date.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
                        {" at "}
                        {date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>

                  <ArrowRight className="text-white/20 shrink-0" size={20} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
