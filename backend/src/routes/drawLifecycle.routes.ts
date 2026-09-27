import express from "express";
import {
  approveDraw,
  publishDrawController,
  lockDrawController,
} from "../controllers/drawLifecycle.controller";
import {
  authenticate,
  requireOrganizer,
} from "../middleware/auth.middleware";

const router = express.Router();

router.post(
  "/:drawId/approve",
  authenticate,
  requireOrganizer,
  approveDraw
);

router.post(
  "/:drawId/publish",
  authenticate,
  requireOrganizer,
  publishDrawController
);

router.post(
  "/:drawId/lock",
  authenticate,
  requireOrganizer,
  lockDrawController
);

export default router;