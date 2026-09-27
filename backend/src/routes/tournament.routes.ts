import { Router } from "express";

import {
  getTournaments,
  createTournament,
  getTournamentBySlug,
  publishTournament,
  updateTournament,
} from "../controllers/tournament.controller";

import {
  authenticate,
  requireOrganizer,
} from "../middleware/auth.middleware";

const router = Router();

router.get("/", getTournaments);

router.patch(
  "/:id/publish",
  authenticate,
  requireOrganizer,
  publishTournament
);

router.patch(
  "/:id",
  authenticate,
  requireOrganizer,
  updateTournament
);

router.get("/:slug", getTournamentBySlug);

router.post(
  "/",
  authenticate,
  requireOrganizer,
  createTournament
);

export default router;