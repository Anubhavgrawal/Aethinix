import express from "express";
import {
  getMatchFixtureConflicts,
  getTournamentFixtureConflicts,
  resolveConflict,
} from "../controllers/fixtureConflict.controller";
import {
  authenticate,
  requireOrganizer,
} from "../middleware/auth.middleware";

const router = express.Router();

router.get(
  "/tournament/:tournamentId",
  authenticate,
  requireOrganizer,
  getTournamentFixtureConflicts
);

router.get(
  "/match/:matchId",
  authenticate,
  requireOrganizer,
  getMatchFixtureConflicts
);

router.patch(
  "/:conflictId/resolve",
  authenticate,
  requireOrganizer,
  resolveConflict
);

export default router;