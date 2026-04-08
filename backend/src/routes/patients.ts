import { Router, Request, Response } from "express";
import prisma from "../prisma";

const router = Router();

// Risk level from score
function getRiskLevel(score: number): string {
  if (score >= 80) return "CRITICAL";
  if (score >= 60) return "HIGH";
  if (score >= 40) return "MEDIUM";
  return "LOW";
}

// GET /api/patients
router.get("/", async (_req: Request, res: Response) => {
  try {
    const patients = await prisma.patient.findMany({
      include: { alerts: true },
      orderBy: { risk_score: "desc" },
    });

    const formatted = patients.map((p) => {
      const vitals = p.vitals as any;
      return {
        id: p.id,
        name: p.name,
        age: p.age,
        gender: (p as any).gender || "Unknown",
        diagnosis: p.diagnosis,
        vitals: {
          heartRate: vitals?.heartRate || 0,
          bloodPressure: vitals?.bloodPressure || "120/80",
          temperature: vitals?.temperature || 36.6,
          oxygenLevel: vitals?.oxygenLevel || 98,
        },
        riskScore: Math.round(p.risk_score),
        riskLevel: getRiskLevel(p.risk_score),
        riskReasons: vitals?.riskReasons || [
          "Vitals analysis pending",
          "Further monitoring needed",
          "Initial assessment",
        ],
      };
    });

    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch patients" });
  }
});

// GET /api/patients/:id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: { alerts: true },
    });

    if (!patient) {
      res.status(404).json({ error: "Patient not found" });
      return;
    }

    const vitals = patient.vitals as any;
    const formatted = {
      id: patient.id,
      name: patient.name,
      age: patient.age,
      gender: (patient as any).gender || "Unknown",
      diagnosis: patient.diagnosis,
      vitals: {
        heartRate: vitals?.heartRate || 0,
        bloodPressure: vitals?.bloodPressure || "120/80",
        temperature: vitals?.temperature || 36.6,
        oxygenLevel: vitals?.oxygenLevel || 98,
      },
      riskScore: Math.round(patient.risk_score),
      riskLevel: getRiskLevel(patient.risk_score),
      riskReasons: vitals?.riskReasons || [
        "Vitals analysis pending",
        "Further monitoring needed",
        "Initial assessment",
      ],
      alerts: patient.alerts.map((a) => ({
        id: a.id,
        severity: a.severity,
        reason: a.reason,
        type: a.type,
        timeAgo: getTimeAgo(a.timestamp),
      })),
    };

    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch patient" });
  }
});

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins} minutes ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hours ago`;
  return `${Math.floor(diffHours / 24)} days ago`;
}

export default router;
