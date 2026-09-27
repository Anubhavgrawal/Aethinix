import { Router } from "express";
import {
  createRegistration,
  getMyRegistrations,
  getTournamentRegistrations,
  updateRegistrationStatus,
  getTournamentPlayers,
  syncApprovedRegistrationsToEntries,
} from "../controllers/registration.controller";
import {
  authenticate,
  requireOrganizer,
} from "../middleware/auth.middleware";

const router = Router();

router.get(
  "/my",
  authenticate,
  getMyRegistrations
);
router.get(
  "/tournament/:tournamentId",
  authenticate,
  requireOrganizer,
  getTournamentRegistrations
);
router.get(
  "/tournament/:tournamentId/players",
  authenticate,
  requireOrganizer,
  getTournamentPlayers
);
router.patch(
  "/:id/status",
  authenticate,
  requireOrganizer,
  updateRegistrationStatus
);
router.post(
  "/",
  authenticate,
  createRegistration
);
router.post(
  "/tournament/:tournamentId/sync-entries",
  authenticate,
  requireOrganizer,
  syncApprovedRegistrationsToEntries
);

export default router;