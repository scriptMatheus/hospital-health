import { Router } from "express";
import { authenticateRequest } from "../utils/authenticateRequest";
import { InstitutionController } from "../institutions/controllers/InstitutionController";

const institutionRoutes = Router();
const institutionController = new InstitutionController();

//insert 
institutionRoutes.post(
    "/", authenticateRequest,
    institutionController.create
);

//list geral 
institutionRoutes.get(
    "/", authenticateRequest,
    institutionController.list
);

//list por Id
institutionRoutes.get(
    "/:institutionId", authenticateRequest,
    institutionController.getById
);

//update
institutionRoutes.patch(
    "/:institutionId", authenticateRequest,
    institutionController.update
);

export { institutionRoutes };