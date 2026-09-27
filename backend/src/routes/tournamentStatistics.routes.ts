import express from "express";
import {
  authenticate,
  requireOrganizer,
} from "../middleware/auth.middleware";
import {
  getTournamentStatisticsController,
} from "../controllers/tournamentStatistics.controller";



const router = express.Router();

router.get(
  "/tournament/:tournamentId",
  authenticate,
  requireOrganizer,
  getTournamentStatisticsController
);

export default router;