import { Request, Response } from "express";
import { container } from "tsyringe";
import { AttendanceService } from "../services/AttendanceService";
import { IAttendanceDTO } from "../interfaces/IAttendanceDTO";
import { PatientService } from "../../patients/services/PatientService";
import { ProfessionalService } from "../../professionals/services/ProfessionalService";

class AttendanceController {
  async create(request: Request, response: Response): Promise<Response> {
    let { patientId, professionalId, attendanceDate, attendanceTime, description } = request.body;

    if (!patientId || !professionalId || !attendanceDate || !attendanceTime) {
      return response.status(400).json({
        error: { message: "os parâmetros não atendem a requisição, falta patientId, professionalId, attendanceDate ou attendanceTime" },
      });
    }

    attendanceDate = attendanceDate.trim();
    attendanceTime = attendanceTime.trim();
    description = description ? String(description).trim() : undefined;

    const normalizedAttendanceDate = normalizeAttendanceDate(attendanceDate);
    if (!normalizedAttendanceDate) {
      return response.status(400).json({
        error: { message: "data do atendimento inválida. Use DD/MM/AAAA ou AAAA-MM-DD" },
      });
    }

    const normalizedAttendanceTime = normalizeAttendanceTime(attendanceTime);
    if (!normalizedAttendanceTime) {
      return response.status(400).json({
        error: { message: "hora do atendimento inválida. Use HH:mm" },
      });
    }

    if (!isFutureAttendance(normalizedAttendanceDate, normalizedAttendanceTime)) {
      return response.status(400).json({
        error: { message: "data e hora do atendimento devem ser futuras" },
      });
    }

    try {
      const patientService = container.resolve(PatientService);
      const existingPatient = await patientService.findById(patientId, request);

      if (!existingPatient) {
        return response.status(400).json({
          error: { message: "Id do paciente informado não existe" },
        });
      }

      const professionalService = container.resolve(ProfessionalService);
      const existingProfessional = await professionalService.findById(professionalId, request);

      if (!existingProfessional) {
        return response.status(400).json({
          error: { message: "Id do profissional informado não existe" },
        });
      }

      const attendanceDTO: IAttendanceDTO = {
        patientId,
        professionalId,
        attendanceDate: normalizedAttendanceDate,
        attendanceTime: normalizedAttendanceTime,
        description,
        status: true,
      };

      const attendanceService = container.resolve(AttendanceService);
      const resp = await attendanceService.createAttendance(attendanceDTO, request);

      return response.status(200).jsonp(resp);
    } catch (error) {
      return response.status(400).json({ status: "error", message: "Erro ao criar atendimento" });
    }
  }

  async list(request: Request, response: Response): Promise<Response> {
    try {
      const attendanceService = container.resolve(AttendanceService);
      const resp = await attendanceService.list(request);
      return response.status(200).jsonp(resp);
    } catch (error) {
      return response.status(503).json({
        error: { message: "Erro ao listar atendimentos" },
      });
    }
  }

  async getById(request: Request, response: Response): Promise<Response> {
    const { attendanceId } = request.params;

    if (!attendanceId) {
      return response.status(400).json({
        error: { message: "os parâmetros não atendem a requisição, falta attendanceId" },
      });
    }

    try {
      const attendanceService = container.resolve(AttendanceService);
      const attendance = await attendanceService.findById(attendanceId, request);

      if (!attendance) {
        return response.status(400).json({
          error: { message: "Id atendimento informado não existe" },
        });
      }

      return response.status(200).jsonp(attendance);
    } catch (error) {
      return response.status(503).json({
        error: { message: "Erro ao buscar atendimento por Id" },
      });
    }
  }

  async update(request: Request, response: Response): Promise<Response> {
    let { patientId, professionalId, attendanceDate, attendanceTime, description } = request.body;
    const { attendanceId } = request.params;

    if (!patientId || !professionalId || !attendanceDate || !attendanceTime || !attendanceId) {
      return response.status(400).json({
        error: { message: "os parâmetros não atendem a requisição, falta patientId, professionalId, attendanceDate, attendanceTime ou attendanceId" },
      });
    }

    attendanceDate = attendanceDate.trim();
    attendanceTime = attendanceTime.trim();
    description = description ? String(description).trim() : undefined;

    const normalizedAttendanceDate = normalizeAttendanceDate(attendanceDate);
    if (!normalizedAttendanceDate) {
      return response.status(400).json({
        error: { message: "data do atendimento inválida. Use DD/MM/AAAA ou AAAA-MM-DD" },
      });
    }

    const normalizedAttendanceTime = normalizeAttendanceTime(attendanceTime);
    if (!normalizedAttendanceTime) {
      return response.status(400).json({
        error: { message: "hora do atendimento inválida. Use HH:mm" },
      });
    }

    if (!isFutureAttendance(normalizedAttendanceDate, normalizedAttendanceTime)) {
      return response.status(400).json({
        error: { message: "data e hora do atendimento devem ser futuras" },
      });
    }

    try {
      const patientService = container.resolve(PatientService);
      const existingPatient = await patientService.findById(patientId, request);

      if (!existingPatient) {
        return response.status(400).json({
          error: { message: "Id do paciente informado não existe" },
        });
      }

      const professionalService = container.resolve(ProfessionalService);
      const existingProfessional = await professionalService.findById(professionalId, request);

      if (!existingProfessional) {
        return response.status(400).json({
          error: { message: "Id do profissional informado não existe" },
        });
      }

      const attendanceService = container.resolve(AttendanceService);
      const existingAttendance = await attendanceService.findById(attendanceId, request);

      if (!existingAttendance) {
        return response.status(400).json(
          { status: "error", message: "Id atendimento não existe" }
        );
      }

      const attendanceDTO: IAttendanceDTO = {
        patientId,
        professionalId,
        attendanceDate: normalizedAttendanceDate,
        attendanceTime: normalizedAttendanceTime,
        description,
        status: existingAttendance.status,
      };

      const resp = await attendanceService.update(attendanceDTO, attendanceId, request);
      return response.status(200).jsonp(resp);
    } catch (error) {
      return response.status(503).json({
        error: { message: "Erro ao editar atendimento" },
      });
    }
  }

  async updateStatus(request: Request, response: Response): Promise<Response> {
    const { attendanceId } = request.params;
    const { status } = request.body;

    if (status == undefined || status == null || !attendanceId) {
      return response.status(400).json({
        error: { message: "os parâmetros não atendem a requisição, falta status ou attendanceId" },
      });
    }

    if (typeof status !== "boolean") {
      return response.status(400).json({
        error: { message: "o parâmetro status deve ser booleano" },
      });
    }

    try {
      const attendanceService = container.resolve(AttendanceService);
      const existingAttendance = await attendanceService.findById(attendanceId, request);

      if (!existingAttendance) {
        return response.status(400).json(
          { status: "error", message: "Id atendimento não existe" }
        );
      }

      const resp = await attendanceService.updateStatus(attendanceId, status ? 1 : 0, request);
      return response.status(200).jsonp(resp);
    } catch (error) {
      return response.status(503).json({
        error: { message: "Erro ao atualizar status do atendimento" },
      });
    }
  }
}

function normalizeAttendanceDate(value: string): string | null {
  const raw = value.trim();

  const brMatch = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (brMatch) {
    const day = Number(brMatch[1]);
    const month = Number(brMatch[2]);
    const year = Number(brMatch[3]);

    const date = new Date(year, month - 1, day);
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }

    const mm = String(month).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return `${year}-${mm}-${dd}`;
  }

  const isoDateMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoDateMatch) {
    const year = Number(isoDateMatch[1]);
    const month = Number(isoDateMatch[2]);
    const day = Number(isoDateMatch[3]);

    const date = new Date(year, month - 1, day);
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }

    return raw;
  }

  return null;
}

function normalizeAttendanceTime(value: string): string | null {
  const raw = value.trim();
  const match = raw.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
  if (!match) {
    return null;
  }

  return raw;
}

function isFutureAttendance(date: string, time: string): boolean {
  const attendanceDateTime = new Date(`${date}T${time}:00`);
  return !isNaN(attendanceDateTime.getTime()) && attendanceDateTime.getTime() > Date.now();
}

export { AttendanceController };
