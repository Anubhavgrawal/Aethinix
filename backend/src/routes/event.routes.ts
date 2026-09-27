import express from "express";
import {
  getCategoryEvents,
  createEvent,
  updateEvent,
} from "../controllers/event.controller";
import {
  authenticate,
  requireOrganizer,
} from "../middleware/auth.middleware";

const router = express.Router();

router.get(
  "/category/:categoryId",
  authenticate,
  requireOrganizer,
  getCategoryEvents
);

router.post(
  "/category/:categoryId",
  authenticate,
  requireOrganizer,
  createEvent
);

router.patch(
  "/:id",
  authenticate,
  requireOrganizer,
  updateEvent
);

export default router;