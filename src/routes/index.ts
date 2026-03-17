import { Router } from "express";
import { institutionRoutes } from "./institution.routes";
import { authRoutes } from "./auth.routes";
import { professionalRoutes } from "./professional.routes";
const router = Router();

router.use("/auth", authRoutes);
router.use("/instituicoes", institutionRoutes);
router.use("/profissionais", professionalRoutes);

export { router };