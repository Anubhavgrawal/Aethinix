import express from "express";
import {
  getTournamentVenues,
  createVenue,
} from "../controllers/venue.controller";
import {
  authenticate,
  requireOrganizer,
} from "../middleware/auth.middleware";

const router = express.Router();

router.get(
  "/tournament/:tournamentId",
  authenticate,
  requireOrganizer,
  getTournamentVenues
);

router.post(
  "/tournament/:tournamentId",
  authenticate,
  requireOrganizer,
  createVenue
);

export default router;