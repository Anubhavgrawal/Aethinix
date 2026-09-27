import express from "express";
import {
  createVersion,
  getVersions,
} from "../controllers/scheduleVersion.controller";
import {
  authenticate,
  requireOrganizer,
} from "../middleware/auth.middleware";

const router = express.Router();

router.post(
  "/draw/:drawId",
  authenticate,
  requireOrganizer,
  createVersion
);

router.get(
  "/draw/:drawId",
  authenticate,
  requireOrganizer,
  getVersions
);

export default router;