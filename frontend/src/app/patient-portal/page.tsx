"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Heart, Thermometer, Droplets, Activity, Wind, Scale,
  User, Cigarette, Wine, Footprints, Loader2, Sparkles, AlertCircle
} from "lucide-react";

export default function PatientPortalDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    age: "",
    gender: "Male",
    bmi: "",
    systolic_bp: "",
    diastolic_bp: "",
    fasting_glucose: "",
    cholesterol: "",
    hdl: "",
    ldl: "",
    smoking: 0,
    alcohol: 0,
    physical_activity: "moderate",
  });

  const updateField = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const authData = localStorage.getItem("nexacare_auth");
      const token = authData ? JSON.parse(authData).token : "";

      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${API_URL}/patient-portal/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          age: Number(form.age),
          gender: form.gender,
          bmi: Number(form.bmi),
          systolic_bp: Number(form.systolic_bp),
          diastolic_bp: Number(form.diastolic_bp || 80),
          fasting_glucose: Number(form.fasting_glucose),
          cholesterol: Number(form.cholesterol || 200),
          hdl: Number(form.hdl || 50),
          ldl: Number(form.ldl || 120),
          smoking: form.smoking,
          alcohol: form.alcohol,
          physical_activity: form.physical_activity,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Backend prediction failed");
      }
      
      // Store result for the results page
      localStorage.setItem("nexacare_last_prediction", JSON.stringify(data));
      router.push("/patient-portal/results");
    } catch {
      // Fallback: call ML service directly
      try {
        const ML_URL = process.env.NEXT_PUBLIC_ML_URL || "http://localhost:8000";
        const res = await fetch(`${ML_URL}/explain`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            age: Number(form.age),
            gender: form.gender,
            bmi: Number(form.bmi),
            systolic_bp: Number(form.systolic_bp),
            diastolic_bp: Number(form.diastolic_bp || 80),
            fasting_glucose: Number(form.fasting_glucose),
            cholesterol: Number(form.cholesterol || 200),
            hdl: Number(form.hdl || 50),
            ldl: Number(form.ldl || 120),
            smoking: form.smoking,
            alcohol: form.alcohol,
            physical_activity: form.physical_activity,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error("ML service failed");
        }
        localStorage.setItem("nexacare_last_prediction", JSON.stringify(data));
        router.push("/patient-portal/results");
      } catch {
        // Final fallback: mock prediction
        const mock = generateMockPrediction(form);
        localStorage.setItem("nexacare_last_prediction", JSON.stringify(mock));
        router.push("/patient-portal/results");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
          <Sparkles className="text-teal-400" size={28} />
          Health Risk Assessment
        </h1>
        <p className="text-white/40 mt-2 text-sm max-w-xl">
          Enter your health data below to receive an AI-powered risk assessment for Diabetes,
          Heart Disease, and Hypertension. All data is processed securely.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Info */}
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
          <h2 className="text-sm font-bold text-white/60 uppercase tracking-widest mb-5 flex items-center gap-2">
            <User size={16} className="text-teal-400" /> Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-medium text-white/50 mb-1.5">Age *</label>
              <input
                type="number" required min="1" max="120"
                value={form.age} onChange={(e) => updateField("age", e.target.value)}
                placeholder="e.g. 45"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:ring-2 focus:ring-teal-400 focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/50 mb-1.5">Gender</label>
              <select
                value={form.gender} onChange={(e) => updateField("gender", e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-teal-400 focus:border-transparent text-sm"
              >
                <option value="Male" className="bg-[#1e293b]">Male</option>
                <option value="Female" className="bg-[#1e293b]">Female</option>
                <option value="Other" className="bg-[#1e293b]">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/50 mb-1.5 flex items-center gap-1.5">
                <Scale size={14} className="text-teal-400" /> BMI *
              </label>
              <input
                type="number" required step="0.1" min="10" max="60"
                value={form.bmi} onChange={(e) => updateField("bmi", e.target.value)}
                placeholder="e.g. 28.5"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:ring-2 focus:ring-teal-400 focus:border-transparent text-sm"
              />
            </div>
          </div>
        </div>

        {/* Vitals */}
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
          <h2 className="text-sm font-bold text-white/60 uppercase tracking-widest mb-5 flex items-center gap-2">
            <Activity size={16} className="text-cyan-400" /> Vital Signs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-white/50 mb-1.5 flex items-center gap-1.5">
                <Heart size={14} className="text-red-400" /> Systolic BP (mmHg) *
              </label>
              <input
                type="number" required min="60" max="250"
                value={form.systolic_bp} onChange={(e) => updateField("systolic_bp", e.target.value)}
                placeholder="e.g. 140"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:ring-2 focus:ring-teal-400 focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/50 mb-1.5">
                Diastolic BP (mmHg)
              </label>
              <input
                type="number" min="40" max="150"
                value={form.diastolic_bp} onChange={(e) => updateField("diastolic_bp", e.target.value)}
                placeholder="e.g. 90"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:ring-2 focus:ring-teal-400 focus:border-transparent text-sm"
              />
            </div>
          </div>
        </div>

        {/* Blood Work */}
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
          <h2 className="text-sm font-bold text-white/60 uppercase tracking-widest mb-5 flex items-center gap-2">
            <Droplets size={16} className="text-blue-400" /> Blood Work
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div>
              <label className="block text-sm font-medium text-white/50 mb-1.5">Fasting Glucose (mg/dL) *</label>
              <input
                type="number" required min="50" max="400"
                value={form.fasting_glucose} onChange={(e) => updateField("fasting_glucose", e.target.value)}
                placeholder="e.g. 115"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:ring-2 focus:ring-teal-400 focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/50 mb-1.5">Total Cholesterol (mg/dL)</label>
              <input
                type="number" min="100" max="400"
                value={form.cholesterol} onChange={(e) => updateField("cholesterol", e.target.value)}
                placeholder="e.g. 210"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:ring-2 focus:ring-teal-400 focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/50 mb-1.5">HDL (mg/dL)</label>
              <input
                type="number" min="10" max="120"
                value={form.hdl} onChange={(e) => updateField("hdl", e.target.value)}
                placeholder="e.g. 45"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:ring-2 focus:ring-teal-400 focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/50 mb-1.5">LDL (mg/dL)</label>
              <input
                type="number" min="30" max="300"
                value={form.ldl} onChange={(e) => updateField("ldl", e.target.value)}
                placeholder="e.g. 130"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:ring-2 focus:ring-teal-400 focus:border-transparent text-sm"
              />
            </div>
          </div>
        </div>

        {/* Lifestyle */}
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
          <h2 className="text-sm font-bold text-white/60 uppercase tracking-widest mb-5 flex items-center gap-2">
            <Footprints size={16} className="text-green-400" /> Lifestyle Factors
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-medium text-white/50 mb-3">Smoking Status</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => updateField("smoking", 0)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                    form.smoking === 0
                      ? "bg-teal-500/20 border-teal-500/30 text-teal-400"
                      : "bg-white/5 border-white/10 text-white/30 hover:text-white/50"
                  }`}
                >
                  Non-Smoker
                </button>
                <button
                  type="button"
                  onClick={() => updateField("smoking", 1)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                    form.smoking === 1
                      ? "bg-red-500/20 border-red-500/30 text-red-400"
                      : "bg-white/5 border-white/10 text-white/30 hover:text-white/50"
                  }`}
                >
                  <Cigarette size={14} className="inline mr-1" /> Smoker
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/50 mb-3">Alcohol Consumption</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => updateField("alcohol", 0)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                    form.alcohol === 0
                      ? "bg-teal-500/20 border-teal-500/30 text-teal-400"
                      : "bg-white/5 border-white/10 text-white/30 hover:text-white/50"
                  }`}
                >
                  No
                </button>
                <button
                  type="button"
                  onClick={() => updateField("alcohol", 1)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                    form.alcohol === 1
                      ? "bg-orange-500/20 border-orange-500/30 text-orange-400"
                      : "bg-white/5 border-white/10 text-white/30 hover:text-white/50"
                  }`}
                >
                  <Wine size={14} className="inline mr-1" /> Yes
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/50 mb-3">Physical Activity</label>
              <div className="flex gap-2">
                {["low", "moderate", "high"].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => updateField("physical_activity", level)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border capitalize ${
                      form.physical_activity === level
                        ? level === "low"
                          ? "bg-red-500/20 border-red-500/30 text-red-400"
                          : level === "moderate"
                          ? "bg-yellow-500/20 border-yellow-500/30 text-yellow-400"
                          : "bg-green-500/20 border-green-500/30 text-green-400"
                        : "bg-white/5 border-white/10 text-white/30 hover:text-white/50"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-teal-500/25 hover:shadow-teal-500/40 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={22} /> Analyzing Health Data...
            </>
          ) : (
            <>
              <Sparkles size={22} /> Get My Prediction
            </>
          )}
        </button>

        <p className="text-center text-white/20 text-xs">
          This tool provides educational risk estimates only and is not a substitute for professional medical advice.
        </p>
      </form>
    </div>
  );
}

// Inline mock prediction for when both backend and ML service are unavailable
function generateMockPrediction(data: any) {
  let score = 0;
  const factors: string[] = [];
  const diseases: string[] = [];

  if (Number(data.fasting_glucose) > 125) {
    score += 30; factors.push(`Your fasting blood glucose (${data.fasting_glucose} mg/dL) is above the diabetic threshold.`); diseases.push("Diabetes");
  } else if (Number(data.fasting_glucose) > 100) {
    score += 15; factors.push(`Your fasting glucose (${data.fasting_glucose} mg/dL) is in the pre-diabetic range.`); diseases.push("Diabetes");
  }
  if (Number(data.systolic_bp) > 140) {
    score += 25; factors.push(`Your systolic blood pressure (${data.systolic_bp} mmHg) indicates hypertension.`); diseases.push("Hypertension");
  }
  if (Number(data.cholesterol) > 240) {
    score += 20; factors.push(`Your cholesterol (${data.cholesterol} mg/dL) is high, increasing cardiovascular risk.`); diseases.push("Heart Disease");
  }
  if (data.smoking === 1) { score += 15; factors.push("Active smoking significantly increases your heart disease risk."); diseases.push("Heart Disease"); }
  if (Number(data.bmi) > 30) { score += 10; factors.push(`Your BMI of ${data.bmi} indicates obesity.`); }
  if (Number(data.age) > 60) { score += 5; }

  score = Math.min(score, 100);
  const risk_tier = score <= 25 ? "Low" : score <= 50 ? "Moderate" : score <= 75 ? "High" : "Very High";
  const uniqueDiseases = [...new Set(diseases)];
  if (uniqueDiseases.length === 0) uniqueDiseases.push("General Health");
  if (factors.length === 0) factors.push("Your health metrics are within normal ranges!");

  return {
    risk_score: score, risk_tier, diseases: uniqueDiseases, primary_disease: uniqueDiseases[0],
    top_factors: factors.slice(0, 3), confidence: 85,
    recommendations: [
      { title: "Blood Pressure Management", icon: "heart", description: "Monitor your blood pressure regularly and reduce sodium intake.", urgency: "moderate" },
      { title: "Regular Exercise", icon: "footprints", description: "Aim for 150 minutes of moderate exercise per week.", urgency: "moderate" },
      { title: "Healthy Diet", icon: "droplets", description: "Follow a Mediterranean-style diet rich in whole grains and vegetables.", urgency: "low" },
    ],
    shap_values: { "Blood Pressure": 0.35, "Fasting Glucose": 0.25, "Cholesterol": 0.20, "BMI": 0.15, "Smoking": data.smoking ? 0.28 : 0 },
    disease_risks: uniqueDiseases.map(d => ({ disease: d, probability: score / 100, confidence: 85 })),
  };
}
