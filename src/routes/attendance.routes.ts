import { Router } from "express";
import { authenticateRequest } from "../utils/authenticateRequest";
import { AttendanceController } from "../attendances/controllers/AttendanceController";

const attendanceRoutes = Router();
const attendanceController = new AttendanceController();

//insert
attendanceRoutes.post(
  "/", authenticateRequest,
  attendanceController.create
);

//list geral
attendanceRoutes.get(
  "/", authenticateRequest,
  attendanceController.list
);

//list por Id
attendanceRoutes.get(
  "/:attendanceId", authenticateRequest,
  attendanceController.getById
);

//update
attendanceRoutes.patch(
  "/:attendanceId", authenticateRequest,
  attendanceController.update
);

//update status
attendanceRoutes.patch(
  "/status/:attendanceId", authenticateRequest,
  attendanceController.updateStatus
);

export { attendanceRoutes };
