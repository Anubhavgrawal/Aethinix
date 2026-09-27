import express from "express";
import {
  getTournamentRule,
  upsertTournamentRule,
} from "../controllers/tournamentRule.controller";
import {
  authenticate,
  requireOrganizer,
} from "../middleware/auth.middleware";

const router = express.Router();

router.get(
  "/:tournamentId",
  authenticate,
  requireOrganizer,
  getTournamentRule
);

router.put(
  "/:tournamentId",
  authenticate,
  requireOrganizer,
  upsertTournamentRule
);

export default router;