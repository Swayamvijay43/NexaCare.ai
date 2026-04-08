import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding NexaCare database...");

  // Clear existing data
  await prisma.healthRecord.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.forecast.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  const passwordHash = await bcrypt.hash("demo123", 10);

  await prisma.user.createMany({
    data: [
      { name: "Dr. Sarah Chen", email: "dr.sarah@nexacare.ai", role: "clinician", password_hash: passwordHash },
      { name: "System Admin", email: "admin@nexacare.ai", role: "admin", password_hash: passwordHash },
      { name: "Rahul Verma", email: "patient@nexacare.ai", role: "patient", password_hash: passwordHash },
    ],
  });

  // Create Patients
  const patients = await Promise.all([
    prisma.patient.create({
      data: {
        name: "Ravi Sharma", age: 67, gender: "Male",
        diagnosis: "Diabetes + Hypertension", risk_score: 92,
        vitals: {
          heartRate: 102, bloodPressure: "158/95", temperature: 37.2, oxygenLevel: 94,
          riskReasons: ["HbA1c critically elevated", "Blood pressure above safe threshold", "Missed 3 follow-up appointments"]
        },
      },
    }),
    prisma.patient.create({
      data: {
        name: "Sunita Rao", age: 45, gender: "Female",
        diagnosis: "Sepsis Risk", risk_score: 95,
        vitals: {
          heartRate: 118, bloodPressure: "88/60", temperature: 39.1, oxygenLevel: 91,
          riskReasons: ["Oxygen saturation dangerously low", "High temperature indicating infection", "Heart rate severely elevated"]
        },
      },
    }),
    prisma.patient.create({
      data: {
        name: "Meera Joshi", age: 72, gender: "Female",
        diagnosis: "Pneumonia", risk_score: 88,
        vitals: {
          heartRate: 95, bloodPressure: "135/85", temperature: 38.8, oxygenLevel: 93,
          riskReasons: ["Age above 65 high risk group", "Respiratory infection detected", "Oxygen levels declining trend"]
        },
      },
    }),
    prisma.patient.create({
      data: {
        name: "Arjun Patel", age: 71, gender: "Male",
        diagnosis: "Heart Failure", risk_score: 85,
        vitals: {
          heartRate: 88, bloodPressure: "145/90", temperature: 36.9, oxygenLevel: 95,
          riskReasons: ["Chronic heart failure history", "Blood pressure elevated", "Age related risk factor"]
        },
      },
    }),
    prisma.patient.create({
      data: {
        name: "Priya Mehta", age: 54, gender: "Female",
        diagnosis: "COPD", risk_score: 78,
        vitals: {
          heartRate: 92, bloodPressure: "128/82", temperature: 37.4, oxygenLevel: 92,
          riskReasons: ["COPD exacerbation risk", "Oxygen borderline low", "Recent medication change"]
        },
      },
    }),
    prisma.patient.create({
      data: {
        name: "Deepak Gupta", age: 68, gender: "Male",
        diagnosis: "Cancer", risk_score: 79,
        vitals: {
          heartRate: 84, bloodPressure: "122/78", temperature: 37.1, oxygenLevel: 96,
          riskReasons: ["Chemotherapy immune suppression", "Age related vulnerability", "Fatigue and weight loss noted"]
        },
      },
    }),
    prisma.patient.create({
      data: {
        name: "Anita Desai", age: 58, gender: "Female",
        diagnosis: "Stroke Risk", risk_score: 74,
        vitals: {
          heartRate: 78, bloodPressure: "162/98", temperature: 36.8, oxygenLevel: 97,
          riskReasons: ["Blood pressure critically high", "Prior TIA history", "Cholesterol levels elevated"]
        },
      },
    }),
    prisma.patient.create({
      data: {
        name: "Vikram Singh", age: 63, gender: "Male",
        diagnosis: "Kidney Disease", risk_score: 61,
        vitals: {
          heartRate: 76, bloodPressure: "138/86", temperature: 36.7, oxygenLevel: 97,
          riskReasons: ["Creatinine levels elevated", "Reduced kidney function", "Fluid retention detected"]
        },
      },
    }),
    prisma.patient.create({
      data: {
        name: "Kiran Nair", age: 55, gender: "Female",
        diagnosis: "Liver Disease", risk_score: 56,
        vitals: {
          heartRate: 72, bloodPressure: "118/76", temperature: 36.9, oxygenLevel: 98,
          riskReasons: ["Liver enzyme levels high", "Moderate risk profile", "Stable but monitoring required"]
        },
      },
    }),
    prisma.patient.create({
      data: {
        name: "Rohit Kumar", age: 49, gender: "Male",
        diagnosis: "Post-Surgery", risk_score: 43,
        vitals: {
          heartRate: 68, bloodPressure: "112/72", temperature: 36.6, oxygenLevel: 99,
          riskReasons: ["Post-operative recovery phase", "Vitals stable and improving", "Low immediate risk"]
        },
      },
    }),
  ]);

  // Create Alerts
  await prisma.alert.createMany({
    data: [
      { patient_id: patients[1].id, type: "clinical", severity: "CRITICAL", reason: "Sepsis imminent", timestamp: new Date(Date.now() - 10 * 60000) },
      { patient_id: patients[0].id, type: "clinical", severity: "HIGH", reason: "HbA1c critical level", timestamp: new Date(Date.now() - 25 * 60000) },
      { patient_id: patients[2].id, type: "clinical", severity: "HIGH", reason: "Oxygen declining trend", timestamp: new Date(Date.now() - 60 * 60000) },
      { patient_id: patients[3].id, type: "vitals", severity: "MEDIUM", reason: "BP threshold crossed", timestamp: new Date(Date.now() - 120 * 60000) },
      { patient_id: patients[4].id, type: "clinical", severity: "MEDIUM", reason: "COPD flare risk", timestamp: new Date(Date.now() - 180 * 60000) },
    ],
  });

  // Create Forecast Data (7 days)
  const now = new Date();
  await prisma.forecast.createMany({
    data: [
      { date: new Date(now.getTime() + 0 * 86400000), beds_needed: 42, staff_needed: 18, icu_probability: 0.65 },
      { date: new Date(now.getTime() + 1 * 86400000), beds_needed: 45, staff_needed: 19, icu_probability: 0.70 },
      { date: new Date(now.getTime() + 2 * 86400000), beds_needed: 48, staff_needed: 21, icu_probability: 0.78 },
      { date: new Date(now.getTime() + 3 * 86400000), beds_needed: 44, staff_needed: 19, icu_probability: 0.68 },
      { date: new Date(now.getTime() + 4 * 86400000), beds_needed: 50, staff_needed: 22, icu_probability: 0.82 },
      { date: new Date(now.getTime() + 5 * 86400000), beds_needed: 47, staff_needed: 20, icu_probability: 0.74 },
      { date: new Date(now.getTime() + 6 * 86400000), beds_needed: 52, staff_needed: 23, icu_probability: 0.85 },
    ],
  });

  console.log("✅ Seed complete! Created:");
  console.log("   • 3 users (clinician, admin, patient) — password: demo123");
  console.log("   • 10 patients with vitals");
  console.log("   • 5 alerts");
  console.log("   • 7-day forecast");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
