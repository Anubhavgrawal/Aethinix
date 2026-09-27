import express from "express";
import { prisma } from "./lib/prisma";
import userRoutes from "./routes/user.routes";
import authRoutes from "./routes/auth.routes";
import tournamentRoutes from "./routes/tournament.routes";
import categoryRoutes from "./routes/category.routes";
import registrationRoutes from "./routes/registration.routes";
import fixtureRoutes from "./routes/fixture.routes";
import tournamentRuleRoutes from "./routes/tournamentRule.routes";
import venueRoutes from "./routes/venue.routes";
import courtRoutes from "./routes/court.routes";
import eventRoutes from "./routes/event.routes";
import tournamentEntryRoutes from "./routes/tournamentEntry.routes";
import fixtureValidationRoutes from "./routes/fixtureValidation.routes";
import drawRoutes from "./routes/draw.routes";
import matchResultRoutes from "./routes/matchResult.routes";
import schedulingRoutes from "./routes/scheduling.routes";
import drawValidationRoutes from "./routes/drawValidation.routes";
import drawLifecycleRoutes from "./routes/drawLifecycle.routes";
import scheduleVersionRoutes from "./routes/scheduleVersion.routes";
import fixtureConflictRoutes from "./routes/fixtureConflict.routes";
import scheduleVersionLifecycleRoutes from "./routes/scheduleVersionLifecycle.routes";
import cors from "cors";
import rankingRoutes from "./routes/ranking.routes";
import tournamentStatisticsRoutes from "./routes/tournamentStatistics.routes";

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);
const PORT = 5001;

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    message: "AETHENIX API is running 🚀",
  });
});

app.get("/api/db-test", async (_req, res) => {
  try {
    const users = await prisma.user.count();

    res.json({
      success: true,
      message: "Database connected successfully 🚀",
      userCount: users,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tournaments", tournamentRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/fixtures", fixtureRoutes);
app.use("/api/tournament-rules", tournamentRuleRoutes);
app.use("/api/venues", venueRoutes);
app.use("/api/courts", courtRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/tournament-entries", tournamentEntryRoutes);
app.use("/api/fixture-validation", fixtureValidationRoutes);
app.use("/api/draws", drawRoutes);
app.use(
  "/api/match-results",
  matchResultRoutes
);
app.use(
  "/api/scheduling",
  schedulingRoutes
);
app.use(
  "/api/draw-validation",
  drawValidationRoutes
);
app.use(
  "/api/draw-lifecycle",
  drawLifecycleRoutes
);
app.use(
  "/api/schedule-versions",
  scheduleVersionRoutes
);
app.use(
  "/api/fixture-conflicts",
  fixtureConflictRoutes
);
app.use(
  "/api/schedule-version-lifecycle",
  scheduleVersionLifecycleRoutes
);
app.use("/api/rankings", rankingRoutes);
app.use(
  "/api/tournament-statistics",
  tournamentStatisticsRoutes
);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


