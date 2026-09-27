import express from "express";
import {
  generateDraw,
  getEventDraw,
} from "../controllers/draw.controller";
import {
  authenticate,
  requireOrganizer,
} from "../middleware/auth.middleware";

const router = express.Router();

router.post(
  "/tournament/:tournamentId/event/:eventId/generate",
  authenticate,
  requireOrganizer,
  generateDraw
);
router.get(
  "/tournament/:tournamentId/event/:eventId",
  authenticate,
  requireOrganizer,
  getEventDraw
);

export default router;