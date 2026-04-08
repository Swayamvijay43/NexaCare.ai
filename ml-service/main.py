from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict, Optional
from fastapi.middleware.cors import CORSMiddleware
import math

app = FastAPI(title="NexaCare ML Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Models
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class PatientData(BaseModel):
    age: float
    heart_rate: float
    systolic_bp: float
    temperature: float
    oxygen_level: float

class PredictionResponse(BaseModel):
    risk_score: int
    risk_level: str
    reasons: List[str]
    confidence: float

class HealthInput(BaseModel):
    age: float
    gender: Optional[str] = "unknown"
    bmi: float
    systolic_bp: float
    diastolic_bp: Optional[float] = 80
    fasting_glucose: float
    cholesterol: Optional[float] = 200
    hdl: Optional[float] = 50
    ldl: Optional[float] = 120
    smoking: Optional[int] = 0
    alcohol: Optional[int] = 0
    physical_activity: Optional[str] = "moderate"

class ShapValue(BaseModel):
    feature: str
    value: float
    contribution: float
    direction: str  # "increases" or "decreases"

class DiseaseRisk(BaseModel):
    disease: str
    probability: float
    confidence: float

class ExplainResponse(BaseModel):
    risk_score: int
    risk_tier: str
    diseases: List[str]
    primary_disease: str
    top_factors: List[str]
    recommendations: List[str]
    confidence: int
    shap_values: Dict[str, float]
    detailed_shap: List[Dict]
    disease_risks: List[Dict]


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Original /predict endpoint (clinician dashboard)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@app.get("/health")
def health():
    return {"status": "ok", "model": "multi-disease-v2", "capabilities": ["predict", "shap", "explain"]}

@app.post("/predict", response_model=PredictionResponse)
def predict(data: PatientData):
    score = 0
    reasons = []

    if data.oxygen_level < 92:
        score += 35
        reasons.append("Oxygen saturation critically low (<92%)")
    elif data.oxygen_level < 95:
        score += 15
        reasons.append("Oxygen saturation borderline low (<95%)")

    if data.heart_rate > 110:
        score += 25
        reasons.append("Heart rate severely elevated (>110 bpm)")
    elif data.heart_rate > 100:
        score += 15
        reasons.append("Heart rate elevated (>100 bpm)")

    if data.systolic_bp > 160:
        score += 20
        reasons.append("Blood pressure critically high (>160 mmHg)")
    elif data.systolic_bp > 140:
        score += 10
        reasons.append("Blood pressure elevated (>140 mmHg)")

    if data.temperature > 39.0:
        score += 20
        reasons.append("High temperature indicating infection (>39.0 °C)")
    elif data.temperature > 38.0:
        score += 10
        reasons.append("Elevated temperature (>38.0 °C)")

    if data.age > 70:
        score += 15
        reasons.append("Age related high risk factor (>70 years)")
    elif data.age > 60:
        score += 8
        reasons.append("Age related vulnerability (>60 years)")

    if score > 100:
        score = 100

    if score < 40:
        risk_level = "LOW"
    elif score < 60:
        risk_level = "MEDIUM"
    elif score < 80:
        risk_level = "HIGH"
    else:
        risk_level = "CRITICAL"
        
    if not reasons:
        reasons.append("Vitals are stable and within normal ranges")

    return PredictionResponse(
        risk_score=int(score),
        risk_level=risk_level,
        reasons=reasons,
        confidence=round(min(85.0 + (score / 10), 99.9), 1)
    )


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SHAP endpoint — feature importance
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@app.post("/shap")
def shap_values(data: HealthInput):
    """Return SHAP-like feature importance values for the prediction"""
    contributions = calculate_shap(data)
    
    # Sort by absolute contribution
    sorted_shap = sorted(contributions, key=lambda x: abs(x["contribution"]), reverse=True)
    
    return {
        "shap_values": {item["feature"]: item["contribution"] for item in sorted_shap},
        "detailed_shap": sorted_shap,
        "base_value": 25.0,  # baseline risk
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Explain endpoint — XAI Layer (Agent 4)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@app.post("/explain")
def explain(data: HealthInput):
    """Full prediction with SHAP explanations, disease detection, and lifestyle recommendations"""
    
    score = 0
    factors = []
    disease_risks = []
    
    # ── Diabetes Assessment ──
    diabetes_score = 0
    if data.fasting_glucose > 125:
        diabetes_score += 40
        score += 25
        factors.append(f"Your fasting blood glucose ({data.fasting_glucose} mg/dL) is above the diabetic threshold of 125 mg/dL — this is the primary indicator for diabetes risk.")
    elif data.fasting_glucose > 100:
        diabetes_score += 20
        score += 12
        factors.append(f"Your fasting glucose ({data.fasting_glucose} mg/dL) falls in the pre-diabetic range (100-125 mg/dL), suggesting early metabolic changes.")
    
    if data.bmi > 30:
        diabetes_score += 20
        score += 8
        factors.append(f"Your BMI of {data.bmi} indicates obesity, which significantly increases insulin resistance and diabetes risk.")
    elif data.bmi > 25:
        diabetes_score += 10
        score += 4
    
    if data.physical_activity == "low":
        diabetes_score += 10
        score += 3
    
    diabetes_confidence = min(55 + diabetes_score, 95)
    disease_risks.append({
        "disease": "Diabetes",
        "probability": min(diabetes_score, 100) / 100,
        "confidence": diabetes_confidence
    })
    
    # ── Heart Disease Assessment ──
    heart_score = 0
    if data.cholesterol and data.cholesterol > 240:
        heart_score += 30
        score += 15
        factors.append(f"Your total cholesterol ({data.cholesterol} mg/dL) exceeds 240 mg/dL, significantly increasing cardiovascular disease risk.")
    elif data.cholesterol and data.cholesterol > 200:
        heart_score += 15
        score += 7
        factors.append(f"Your cholesterol ({data.cholesterol} mg/dL) is borderline high, warranting dietary attention.")
    
    if data.hdl and data.hdl < 40:
        heart_score += 25
        score += 12
        factors.append(f"Your HDL ('good') cholesterol at {data.hdl} mg/dL is critically low (<40), removing protective cardiovascular benefits.")
    elif data.hdl and data.hdl < 50:
        heart_score += 10
        score += 5
    
    if data.smoking == 1:
        heart_score += 25
        score += 15
        factors.append("Active smoking is one of the strongest independent risk factors for coronary artery disease and stroke.")
    
    if data.age > 65:
        heart_score += 15
        score += 5
    elif data.age > 50:
        heart_score += 8
        score += 3
    
    heart_confidence = min(55 + heart_score, 95)
    disease_risks.append({
        "disease": "Heart Disease",
        "probability": min(heart_score, 100) / 100,
        "confidence": heart_confidence
    })
    
    # ── Hypertension Assessment ──
    hyp_score = 0
    if data.systolic_bp > 160:
        hyp_score += 45
        score += 20
        factors.append(f"Your systolic blood pressure ({data.systolic_bp} mmHg) is in Stage 2 hypertension (>160), requiring immediate medical attention.")
    elif data.systolic_bp > 140:
        hyp_score += 30
        score += 12
        factors.append(f"Your systolic blood pressure ({data.systolic_bp} mmHg) indicates Stage 1 hypertension (140-160 mmHg).")
    elif data.systolic_bp > 130:
        hyp_score += 15
        score += 6
        factors.append(f"Your blood pressure ({data.systolic_bp} mmHg) is elevated above the optimal 120 mmHg threshold.")
    
    if data.alcohol == 1:
        hyp_score += 10
        score += 3
        factors.append("Regular alcohol consumption contributes to elevated blood pressure and liver stress.")
    
    hyp_confidence = min(55 + hyp_score, 95)
    disease_risks.append({
        "disease": "Hypertension",
        "probability": min(hyp_score, 100) / 100,
        "confidence": hyp_confidence
    })
    
    # ── Age factor ──
    if data.age > 70:
        score += 5
        if not any("age" in f.lower() for f in factors):
            factors.append(f"At age {int(data.age)}, age itself becomes an independent risk factor across all chronic conditions.")
    elif data.age > 60:
        score += 3
    
    # Cap score
    score = min(score, 100)
    
    # ── Risk Tier ──
    if score <= 25:
        risk_tier = "Low"
    elif score <= 50:
        risk_tier = "Moderate"
    elif score <= 75:
        risk_tier = "High"
    else:
        risk_tier = "Very High"
    
    # ── Determine diseases ──
    detected = sorted(disease_risks, key=lambda x: x["probability"], reverse=True)
    diseases = [d["disease"] for d in detected if d["probability"] > 0.15]
    if not diseases:
        diseases = ["General Health"]
    
    primary_disease = detected[0]["disease"] if detected else "General Health"
    
    # Ensure at least one factor
    if not factors:
        factors.append("Your health metrics are within normal ranges. Continue maintaining your healthy lifestyle!")
    
    # ── SHAP values ──
    shap = calculate_shap(data)
    shap_dict = {item["feature"]: item["contribution"] for item in shap}
    
    # ── Recommendations ──
    recommendations = generate_recommendations(data, diseases, factors)
    
    # Overall confidence
    overall_confidence = min(70 + int(score * 0.25), 96)
    
    return {
        "risk_score": score,
        "risk_tier": risk_tier,
        "diseases": diseases,
        "primary_disease": primary_disease,
        "top_factors": factors[:3],
        "recommendations": recommendations[:3],
        "confidence": overall_confidence,
        "shap_values": shap_dict,
        "detailed_shap": shap[:5],
        "disease_risks": detected,
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Helper Functions
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def calculate_shap(data: HealthInput) -> list:
    """Calculate SHAP-like feature importance contributions"""
    contributions = []
    
    # Blood pressure contribution
    bp_contrib = 0
    if data.systolic_bp > 140:
        bp_contrib = 0.35 + (data.systolic_bp - 140) * 0.005
    elif data.systolic_bp > 130:
        bp_contrib = 0.15
    elif data.systolic_bp > 120:
        bp_contrib = 0.05
    else:
        bp_contrib = -0.05
    contributions.append({
        "feature": "Blood Pressure",
        "value": data.systolic_bp,
        "contribution": round(min(bp_contrib, 0.6), 3),
        "direction": "increases" if bp_contrib > 0 else "decreases"
    })
    
    # Glucose contribution
    gluc_contrib = 0
    if data.fasting_glucose > 125:
        gluc_contrib = 0.30 + (data.fasting_glucose - 125) * 0.003
    elif data.fasting_glucose > 100:
        gluc_contrib = 0.15
    else:
        gluc_contrib = -0.05
    contributions.append({
        "feature": "Fasting Glucose",
        "value": data.fasting_glucose,
        "contribution": round(min(gluc_contrib, 0.5), 3),
        "direction": "increases" if gluc_contrib > 0 else "decreases"
    })
    
    # Cholesterol contribution
    chol_contrib = 0
    chol_val = data.cholesterol or 200
    if chol_val > 240:
        chol_contrib = 0.25
    elif chol_val > 200:
        chol_contrib = 0.10
    else:
        chol_contrib = -0.03
    contributions.append({
        "feature": "Cholesterol",
        "value": chol_val,
        "contribution": round(chol_contrib, 3),
        "direction": "increases" if chol_contrib > 0 else "decreases"
    })
    
    # BMI contribution
    bmi_contrib = 0
    if data.bmi > 30:
        bmi_contrib = 0.20
    elif data.bmi > 25:
        bmi_contrib = 0.10
    elif data.bmi > 18.5:
        bmi_contrib = -0.05
    else:
        bmi_contrib = 0.05
    contributions.append({
        "feature": "BMI",
        "value": data.bmi,
        "contribution": round(bmi_contrib, 3),
        "direction": "increases" if bmi_contrib > 0 else "decreases"
    })
    
    # HDL contribution
    hdl_val = data.hdl or 50
    hdl_contrib = 0
    if hdl_val < 40:
        hdl_contrib = 0.22
    elif hdl_val < 50:
        hdl_contrib = 0.10
    elif hdl_val > 60:
        hdl_contrib = -0.10
    else:
        hdl_contrib = -0.02
    contributions.append({
        "feature": "HDL Cholesterol",
        "value": hdl_val,
        "contribution": round(hdl_contrib, 3),
        "direction": "increases" if hdl_contrib > 0 else "decreases"
    })
    
    # Smoking contribution
    smoke_contrib = 0.28 if data.smoking == 1 else -0.02
    contributions.append({
        "feature": "Smoking",
        "value": data.smoking or 0,
        "contribution": round(smoke_contrib, 3),
        "direction": "increases" if smoke_contrib > 0 else "decreases"
    })
    
    # Age contribution
    age_contrib = 0
    if data.age > 70:
        age_contrib = 0.18
    elif data.age > 60:
        age_contrib = 0.10
    elif data.age > 50:
        age_contrib = 0.05
    else:
        age_contrib = -0.03
    contributions.append({
        "feature": "Age",
        "value": data.age,
        "contribution": round(age_contrib, 3),
        "direction": "increases" if age_contrib > 0 else "decreases"
    })
    
    # Physical activity
    pa_contrib = 0
    if data.physical_activity == "low":
        pa_contrib = 0.12
    elif data.physical_activity == "moderate":
        pa_contrib = -0.02
    else:
        pa_contrib = -0.10
    contributions.append({
        "feature": "Physical Activity",
        "value": data.physical_activity or "moderate",
        "contribution": round(pa_contrib, 3),
        "direction": "increases" if pa_contrib > 0 else "decreases"
    })
    
    # Sort by absolute contribution
    contributions.sort(key=lambda x: abs(x["contribution"]), reverse=True)
    return contributions


def generate_recommendations(data: HealthInput, diseases: list, factors: list) -> list:
    """Generate personalized lifestyle recommendations based on risk factors"""
    recs = []
    
    if "Hypertension" in diseases or data.systolic_bp > 130:
        recs.append({
            "title": "Blood Pressure Management",
            "icon": "heart",
            "description": "Reduce sodium intake to under 2,300 mg/day. Practice the DASH diet (rich in fruits, vegetables, and whole grains). Try 10 minutes of deep breathing or meditation daily to manage stress.",
            "urgency": "high" if data.systolic_bp > 140 else "moderate"
        })
    
    if "Diabetes" in diseases or data.fasting_glucose > 100:
        recs.append({
            "title": "Blood Sugar Control",
            "icon": "droplet",
            "description": "Adopt a Mediterranean-style diet: limit refined carbs and added sugars, increase fiber intake to 25-30g daily. Consider monitoring blood sugar levels at home and consult your doctor about HbA1c testing.",
            "urgency": "high" if data.fasting_glucose > 125 else "moderate"
        })
    
    if "Heart Disease" in diseases or (data.cholesterol and data.cholesterol > 200):
        recs.append({
            "title": "Cardiovascular Health",
            "icon": "activity",
            "description": "Increase omega-3 intake through fatty fish (salmon, mackerel) twice weekly. Aim for 150 minutes of moderate aerobic exercise per week. Consider plant sterols to help lower LDL cholesterol naturally.",
            "urgency": "high" if (data.cholesterol and data.cholesterol > 240) else "moderate"
        })
    
    if data.smoking == 1:
        recs.append({
            "title": "Smoking Cessation",
            "icon": "wind",
            "description": "Quitting smoking is the single most impactful change for your health. Within 1 year, heart disease risk drops by 50%. Talk to your doctor about cessation programs, nicotine patches, or prescription aids like varenicline.",
            "urgency": "high"
        })
    
    if data.bmi and data.bmi > 25:
        recs.append({
            "title": "Weight Management",
            "icon": "scale",
            "description": f"At a BMI of {data.bmi}, targeting even a 5-10% weight reduction can dramatically improve blood pressure, blood sugar, and cholesterol. Focus on portion control and aim to create a modest 500 kcal daily deficit.",
            "urgency": "moderate" if data.bmi < 30 else "high"
        })
    
    if data.physical_activity == "low":
        recs.append({
            "title": "Physical Activity Plan",
            "icon": "footprints",
            "description": "Start with 20-minute brisk walks 3 times per week and gradually build to 150 minutes. Regular exercise improves insulin sensitivity, lowers blood pressure, and strengthens your heart. Even standing more throughout the day helps.",
            "urgency": "moderate"
        })
    
    if data.alcohol == 1:
        recs.append({
            "title": "Alcohol Moderation",
            "icon": "glass-water",
            "description": "Limit alcohol to no more than 1 drink per day for women or 2 for men. Excessive alcohol raises blood pressure, contributes to liver disease, and adds empty calories that affect weight management.",
            "urgency": "moderate"
        })
    
    # Always include at minimum 3 recommendations
    defaults = [
        {
            "title": "Regular Health Monitoring",
            "icon": "stethoscope",
            "description": "Schedule regular check-ups every 6 months. Track your blood pressure, blood sugar, and cholesterol at home. Early detection of changes allows for timely intervention.",
            "urgency": "low"
        },
        {
            "title": "Sleep & Recovery",
            "icon": "moon",
            "description": "Aim for 7-8 hours of quality sleep nightly. Poor sleep is linked to higher blood pressure, insulin resistance, and weight gain. Maintain a consistent sleep schedule and limit screen time before bed.",
            "urgency": "low"
        },
        {
            "title": "Hydration & Nutrition",
            "icon": "droplets",
            "description": "Drink at least 8 glasses of water daily. Eat a variety of colorful fruits and vegetables, aiming for 5+ servings per day. Prioritize whole foods over processed alternatives.",
            "urgency": "low"
        }
    ]
    
    for d in defaults:
        if len(recs) >= 3:
            break
        if not any(r["title"] == d["title"] for r in recs):
            recs.append(d)
    
    return recs[:3]


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
