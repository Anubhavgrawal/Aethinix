import express from "express";
import {
  getTournamentEntries,
  createTournamentEntry,
} from "../controllers/tournamentEntry.controller";
import {
  authenticate,
  requireOrganizer,
} from "../middleware/auth.middleware";

const router = express.Router();

router.get(
  "/tournament/:tournamentId",
  authenticate,
  requireOrganizer,
  getTournamentEntries
);

router.post(
  "/tournament/:tournamentId",
  authenticate,
  requireOrganizer,
  createTournamentEntry
);

export default router;