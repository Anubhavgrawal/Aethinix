import { Router } from "express";
import {
  generateFixtures,
  getTournamentFixtures,
  updateFixtureResult,
} from "../controllers/fixture.controller";
import {
  authenticate,
  requireOrganizer,
} from "../middleware/auth.middleware";

const router = Router();

// Generate fixtures for a tournament category
router.post(
  "/generate",
  authenticate,
  requireOrganizer,
  generateFixtures
);

// Get all fixtures of a tournament
router.get(
  "/tournament/:tournamentId",
  authenticate,
  requireOrganizer,
  getTournamentFixtures
);
router.patch(
  "/:id/result",
  authenticate,
  requireOrganizer,
  updateFixtureResult
);

export default router;