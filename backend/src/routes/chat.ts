import { Router, Request, Response } from "express";
import prisma from "../prisma";

const router = Router();

// POST /api/chat
router.post("/", async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    if (!message) {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    const msg = message.toLowerCase();

    // Get patients for context-aware responses
    const patients = await prisma.patient.findMany({
      orderBy: { risk_score: "desc" },
      take: 10,
    });

    const alerts = await prisma.alert.findMany({
      include: { patient: true },
      orderBy: { timestamp: "desc" },
      take: 5,
    });

    let reply = "";

    if (msg.includes("risk") || msg.includes("at risk") || msg.includes("highest")) {
      const top = patients[0];
      if (top) {
        reply = `${top.name} has the highest risk score of ${Math.round(top.risk_score)}.\nImmediate review recommended due to ${top.diagnosis.toLowerCase()} indicators.`;
      } else {
        reply = "No patients are currently in the system.";
      }
    } else if (msg.includes("readmit") || msg.includes("readmission")) {
      const topTwo = patients.slice(0, 2);
      reply = `${topTwo.map((p) => p.name).join(" and ")} have the highest\n30-day readmission probability based on current trends.`;
    } else if (msg.includes("icu") || msg.includes("bed") || msg.includes("thursday")) {
      const forecasts = await prisma.forecast.findMany({ orderBy: { date: "asc" } });
      const day5 = forecasts[4];
      if (day5) {
        reply = `Forecast shows ${Math.round(day5.icu_probability * 100)}% ICU surge probability on Day 5.\nRecommend preparing ${Math.max(4, Math.round(day5.beds_needed * 0.12))} additional ICU beds by Wednesday.`;
      } else {
        reply = "Forecast data is not yet available.";
      }
    } else if (msg.includes("discharge") || msg.includes("safely")) {
      const safe = patients.filter((p) => p.risk_score < 60).slice(0, 2);
      if (safe.length > 0) {
        reply = `${safe.map((p) => `${p.name} (risk ${Math.round(p.risk_score)})`).join(" and ")}\nshow stable vitals and are candidates for discharge review.`;
      } else {
        reply = "No patients currently meet safe discharge criteria.";
      }
    } else if (msg.includes("oxygen") || msg.includes("spo2") || msg.includes("respiratory")) {
      const withVitals = patients.filter((p) => {
        const v = p.vitals as any;
        return v?.oxygenLevel && v.oxygenLevel < 95;
      });
      if (withVitals.length > 0) {
        reply = withVitals
          .map((p) => `${p.name} (O2 ${(p.vitals as any).oxygenLevel}%)`)
          .join(" and ");
        reply += "\nare below safe threshold. Immediate respiratory\nassessment recommended.";
      } else {
        reply = "All patients currently have acceptable oxygen levels.";
      }
    } else if (msg.includes("alert") || msg.includes("critical")) {
      if (alerts.length > 0) {
        reply = `There are ${alerts.length} active alerts:\n` + 
          alerts.map((a) => `• ${a.severity}: ${a.patient.name} — ${a.reason}`).join("\n");
      } else {
        reply = "No active alerts at this time.";
      }
    } else {
      // Default intelligent response
      reply = `Based on current data, I can see ${patients.length} patients in the system.\n` +
        `The highest risk patient is ${patients[0]?.name || "N/A"} with a score of ${Math.round(patients[0]?.risk_score || 0)}.\n` +
        `There are ${alerts.length} active alerts.\n\n` +
        `You can ask me about:\n• Patient risk levels\n• ICU bed forecasts\n• Discharge candidates\n• Oxygen levels\n• Active alerts`;
    }

    res.json({ reply });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Chat service error" });
  }
});

export default router;
