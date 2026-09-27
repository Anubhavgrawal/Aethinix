import express from "express";
import {
  validateVersion,
  approveVersion,
  publishVersion,
} from "../controllers/scheduleVersionLifecycle.controller";
import {
  authenticate,
  requireOrganizer,
} from "../middleware/auth.middleware";

const router = express.Router();

router.post(
  "/:versionId/validate",
  authenticate,
  requireOrganizer,
  validateVersion
);

router.post(
  "/:versionId/approve",
  authenticate,
  requireOrganizer,
  approveVersion
);

router.post(
  "/:versionId/publish",
  authenticate,
  requireOrganizer,
  publishVersion
);

export default router;