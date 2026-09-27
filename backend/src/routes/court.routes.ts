import express from "express";
import {
  getVenueCourts,
  createCourt,
  updateCourt,
} from "../controllers/court.controller";
import {
  authenticate,
  requireOrganizer,
} from "../middleware/auth.middleware";

const router = express.Router();

router.get(
  "/venue/:venueId",
  authenticate,
  requireOrganizer,
  getVenueCourts
);

router.post(
  "/venue/:venueId",
  authenticate,
  requireOrganizer,
  createCourt
);

router.patch(
  "/:id",
  authenticate,
  requireOrganizer,
  updateCourt
);

export default router;