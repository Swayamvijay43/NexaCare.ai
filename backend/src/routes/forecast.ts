import { Router, Request, Response } from "express";
import prisma from "../prisma";

const router = Router();

// GET /api/forecast
router.get("/", async (_req: Request, res: Response) => {
  try {
    const forecasts = await prisma.forecast.findMany({
      orderBy: { date: "asc" },
    });

    const formatted = forecasts.map((f, index) => ({
      day: index + 1,
      beds_needed: f.beds_needed,
      staff_needed: f.staff_needed,
      icu_prob: f.icu_probability,
    }));

    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch forecast" });
  }
});

export default router;
