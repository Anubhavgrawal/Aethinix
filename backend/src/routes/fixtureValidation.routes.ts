import express from "express";
import { validateFixtureEvent } from "../controllers/fixtureValidation.controller";
import {
  authenticate,
  requireOrganizer,
} from "../middleware/auth.middleware";

const router = express.Router();

router.post(
  "/tournament/:tournamentId/event/:eventId",
  authenticate,
  requireOrganizer,
  validateFixtureEvent
);

export default router;