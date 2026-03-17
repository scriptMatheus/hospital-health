import { Router } from "express";
import { AuthController } from "../auth/controllers/AuthController";

const authRoutes = Router();
const authController = new AuthController();

authRoutes.post("/", authController.generateToken);

export { authRoutes };
