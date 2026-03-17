import { Request, Response } from "express";
import { container } from "tsyringe";
import { PatientService } from "../services/PatientService";
import { IPatientDTO } from "../interfaces/IPatientDTO";
import { ProfessionalService } from "../../professionals/services/ProfessionalService";

class PatientController {
  async create(request: Request, response: Response): Promise<Response> {
    let { name, bornDate, professionalId } = request.body;

    if (!name || !bornDate || !professionalId) {
      return response.status(400).json({
        error: { message: "os parâmetros não atendem a requisição, falta name, bornDate ou professionalId" },
      });
    }

    name = name.trim();
    bornDate = bornDate.trim();

    if (name.length < 3) {
      return response.status(400).json({
        error: { message: "nome muito curto, deve ter pelo menos 3 caracteres" },
      });
    } else if (name.length > 150) {
      return response.status(400).json({
        error: { message: "o parâmetro name não pode ter mais de 150 caracteres" },
      });
    }

    const normalizedBornDate = normalizeBornDate(bornDate);

    if (!normalizedBornDate) {
      return response.status(400).json({
        error: { message: "data de nascimento inválida. Use DD/MM/AAAA ou AAAA-MM-DD" },
      });
    }

    bornDate = normalizedBornDate;

    //valida professionalId existe
    let professionalService = container.resolve(ProfessionalService);
    const existingProfessional = await professionalService.findById(professionalId, request);

    if (!existingProfessional) {
      return response.status(400).json({
        error: { message: "Id do profissional informado não existe" },
      });
    }
    
    try {
      const professionalService = container.resolve(ProfessionalService);
      const existingProfessional = await professionalService.findById(professionalId, request);

      if (!existingProfessional) {
        return response.status(400).json({
          error: { message: "Id do profissional informado não existe" },
        });
      }

      const patientDTO: IPatientDTO = {
        name,
        bornDate,
        professionalId,
        status: true,
      };

      const patientService = container.resolve(PatientService);
      const resp = await patientService.createPatient(patientDTO, request);

      return response.status(200).jsonp(resp);
    } catch (error) {
      return response.status(400).json({ status: "error", message: "Erro ao criar paciente" });
    }
  }

  async list(request: Request, response: Response): Promise<Response> {
    try {
      const patientService = container.resolve(PatientService);
      const resp = await patientService.list(request);
      return response.status(200).jsonp(resp);
    } catch (error) {
      return response.status(503).json({
        error: { message: "Erro ao listar pacientes" },
      });
    }
  }

  async getById(request: Request, response: Response): Promise<Response> {
    const { patientId } = request.params;

    if (!patientId) {
      return response.status(400).json({
        error: { message: "os parâmetros não atendem a requisição, falta patientId" },
      });
    }

    try {
      const patientService = container.resolve(PatientService);
      const patient = await patientService.findById(patientId, request);

      if (!patient) {
        return response.status(400).json({
          error: { message: "Id paciente informado não existe" },
        });
      }

      return response.status(200).jsonp(patient);
    } catch (error) {
      return response.status(503).json({
        error: { message: "Erro ao buscar paciente por Id" },
      });
    }
  }

  async update(request: Request, response: Response): Promise<Response> {
    let { name, bornDate, professionalId } = request.body;
    const { patientId } = request.params;

    if (!name || !bornDate || !professionalId || !patientId) {
      return response.status(400).json({
        error: { message: "os parâmetros não atendem a requisição, falta name, bornDate, professionalId ou patientId" },
      });
    }

    name = name.trim();
    bornDate = bornDate.trim();

    if (name.length < 3) {
      return response.status(400).json({
        error: { message: "nome muito curto, deve ter pelo menos 3 caracteres" },
      });
    } else if (name.length > 150) {
      return response.status(400).json({
        error: { message: "o parâmetro name não pode ter mais de 150 caracteres" },
      });
    }

    const normalizedBornDate = normalizeBornDate(bornDate);

    if (!normalizedBornDate) {
      return response.status(400).json({
        error: { message: "data de nascimento inválida. Use DD/MM/AAAA ou AAAA-MM-DD" },
      });
    }

    bornDate = normalizedBornDate;

    //valida professionalId existe
    let professionalService = container.resolve(ProfessionalService);
    const existingProfessional = await professionalService.findById(professionalId, request);

    if (!existingProfessional) {
      return response.status(400).json({
        error: { message: "Id do profissional informado não existe" },
      });
    }

    try {
      const professionalService = container.resolve(ProfessionalService);
      const existingProfessional = await professionalService.findById(professionalId, request);

      if (!existingProfessional) {
        return response.status(400).json({
          error: { message: "Id do profissional informado não existe" },
        });
      }

      const patientService = container.resolve(PatientService);
      const existingPatient = await patientService.findById(patientId, request);

      if (!existingPatient) {
        return response.status(400).json(
          { status: "error", message: "Id paciente não existe" }
        );
      }

      const patientDTO: IPatientDTO = {
        name,
        bornDate,
        professionalId,
        status: existingPatient.status,
      };

      const resp = await patientService.update(patientDTO, patientId, request);
      return response.status(200).jsonp(resp);
    } catch (error) {
      return response.status(503).json({
        error: { message: "Erro ao editar paciente" },
      });
    }
  }

  async updateStatus(request: Request, response: Response): Promise<Response> {
    const { patientId } = request.params;
    const { status } = request.body;

    if (status == undefined || status == null || !patientId) {
      return response.status(400).json({
        error: { message: "os parâmetros não atendem a requisição, falta status ou patientId" },
      });
    }

    if (typeof status !== "boolean") {
      return response.status(400).json({
        error: { message: "o parâmetro status deve ser booleano" },
      });
    }

    try {
      const patientService = container.resolve(PatientService);
      const existingPatient = await patientService.findById(patientId, request);

      if (!existingPatient) {
        return response.status(400).json(
          { status: "error", message: "Id paciente não existe" }
        );
      }

      const resp = await patientService.updateStatus(patientId, status ? 1 : 0, request);
      return response.status(200).jsonp(resp);
    } catch (error) {
      return response.status(503).json({
        error: { message: "Erro ao atualizar status do paciente" },
      });
    }
  }
}

function normalizeBornDate(value: string): string | null {
  const raw = value.trim();

  // Formato BR: DD/MM/AAAA
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

  // Formato ISO de data: AAAA-MM-DD
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

export { PatientController };
