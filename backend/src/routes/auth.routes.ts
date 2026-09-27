import { Router } from "express";
import { login } from "../controllers/auth.controller";

const router = Router();

router.post("/login", (req, res, next) => {
  console.log("BODY:", req.body);
  next();
}, login);

export default router; 