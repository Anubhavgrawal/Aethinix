import { Router } from "express";
import {
  getCategories,
  createCategory,
} from "../controllers/category.controller";
import {
  authenticate,
  requireOrganizer,
} from "../middleware/auth.middleware";

const router = Router();

router.get(
  "/:tournamentId",
  authenticate,
  requireOrganizer,
  getCategories
);

router.post(
  "/:tournamentId",
  authenticate,
  requireOrganizer,
  createCategory
);

export default router;