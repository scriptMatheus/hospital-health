import { Router } from "express";
import { authenticateRequest } from "../utils/authenticateRequest";
import { ProfessionalController } from "../professionals/controllers/ProfessionalController";

const professionalRoutes = Router();
const professionalController = new ProfessionalController();

//insert
professionalRoutes.post(
  "/", authenticateRequest,
  professionalController.create
);

//list geral
professionalRoutes.get(
  "/", authenticateRequest,
  professionalController.list
);

//list por Id
professionalRoutes.get(
  "/:professionalId", authenticateRequest,
  professionalController.getById
);

//update
professionalRoutes.patch(
  "/:professionalId", authenticateRequest,
  professionalController.update
);

export { professionalRoutes };
