import express from "express";
import {
  authenticate,
  requireOrganizer,
} from "../middleware/auth.middleware";
import {
  getRankings,
} from "../controllers/ranking.controller";

const router = express.Router();

router.get(
  "/tournament/:tournamentId/event/:eventId",
  authenticate,
  requireOrganizer,
  getRankings
);

export default router;