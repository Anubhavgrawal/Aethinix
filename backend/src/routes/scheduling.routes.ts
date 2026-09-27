import express from "express";
import {
  generateScheduleSlots,
  assignDrawMatches,
} from "../controllers/scheduling.controller";
import {
  authenticate,
  requireOrganizer,
} from "../middleware/auth.middleware";

const router = express.Router();

router.post(
  "/tournament/:tournamentId/generate-slots",
  authenticate,
  requireOrganizer,
  generateScheduleSlots
);
router.post(
  "/draw/:drawId/assign",
  authenticate,
  requireOrganizer,
  assignDrawMatches
);

export default router;