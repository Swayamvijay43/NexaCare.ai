import { Router, Request, Response } from "express";
import prisma from "../prisma";

const router = Router();

// GET /api/alerts
router.get("/", async (_req: Request, res: Response) => {
  try {
    const alerts = await prisma.alert.findMany({
      include: { patient: true },
      orderBy: { timestamp: "desc" },
    });

    const formatted = alerts.map((a) => ({
      id: a.id,
      patientName: a.patient.name,
      patientId: a.patient.id,
      severity: a.severity,
      reason: a.reason,
      type: a.type,
      timeAgo: getTimeAgo(a.timestamp),
    }));

    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch alerts" });
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
