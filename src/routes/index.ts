import { Router } from "express";
import { institutionRoutes } from "./institution.routes";
import { authRoutes } from "./auth.routes";
import { professionalRoutes } from "./professional.routes";
import { patientRoutes } from "./patient.routes";
const router = Router();

router.use("/auth", authRoutes);
router.use("/instituicoes", institutionRoutes);
router.use("/profissionais", professionalRoutes);
router.use("/pacientes", patientRoutes);

export { router };