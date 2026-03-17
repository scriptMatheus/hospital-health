import { Router } from "express";
import { authenticateRequest } from "../utils/authenticateRequest";
import { PatientController } from "../patients/controllers/PatientController";

const patientRoutes = Router();
const patientController = new PatientController();

//insert
patientRoutes.post(
  "/", authenticateRequest,
  patientController.create
);

//list geral
patientRoutes.get(
  "/", authenticateRequest,
  patientController.list
);

//list por Id
patientRoutes.get(
  "/:patientId", authenticateRequest,
  patientController.getById
);

//update
patientRoutes.patch(
  "/:patientId", authenticateRequest,
  patientController.update
);

//update status
patientRoutes.patch(
  "/status/:patientId", authenticateRequest,
  patientController.updateStatus
);

export { patientRoutes };
