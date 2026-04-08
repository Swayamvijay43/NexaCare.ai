import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth";
import patientRoutes from "./routes/patients";
import alertRoutes from "./routes/alerts";
import forecastRoutes from "./routes/forecast";
import chatRoutes from "./routes/chat";
import patientPortalRoutes from "./routes/patient-portal";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "Backend is running", timestamp: new Date() });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/forecast", forecastRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/patient-portal", patientPortalRoutes);

app.listen(PORT, () => {
  console.log(`🚀 NexaCare Backend running on port ${PORT}`);
});
