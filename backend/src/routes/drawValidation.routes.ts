import express from "express";
import { validateDrawController } from "../controllers/drawValidation.controller";
import {
  authenticate,
  requireOrganizer,
} from "../middleware/auth.middleware";

const router = express.Router();

router.post(
  "/:drawId",
  authenticate,
  requireOrganizer,
  validateDrawController
);

export default router;