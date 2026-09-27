import { Router } from "express";

import {
  createUser,
  getMe,
  createOrganizer,
} from "../controllers/user.controller";

import {
  authenticate,
  requireSuperAdmin,
} from "../middleware/auth.middleware";

const router = Router();

router.post("/", createUser);

router.get("/me", authenticate, getMe);

router.post(
  "/organizers",
  authenticate,
  requireSuperAdmin,
  createOrganizer
);

export default router;