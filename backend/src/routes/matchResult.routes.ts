import express from "express";
import {
  submitMatchResult,
} from "../controllers/matchResult.controller";
import {
  authenticate,
  requireOrganizer,
} from "../middleware/auth.middleware";

const router = express.Router();

router.patch(
  "/:matchId",
  authenticate,
  requireOrganizer,
  submitMatchResult
);

export default router;