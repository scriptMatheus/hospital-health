import { Request, Response } from "express";
import { container } from "tsyringe";
import { ProfessionalService } from "../services/ProfessionalService";
import { IProfessionalDTO } from "../interfaces/ProfessionalDTO";
import { InstitutionService } from "../../institutions/services/InstitutionService";
import { InstitutionProfessional } from "../../institutionProfessional/entities/InstitutionProfessional";
import { IInstitutionProfessionalDTO } from "../../institutionProfessional/interfaces/IInstitutionProfessionalDTO";
import { InstitutionProfessionalService } from "../../institutionProfessional/services/InstitutionProfessionalService";

class ProfessionalController {
  async create(request: Request, response: Response): Promise<Response> {
    let { name, crm, cpf, specialty, institutionId } = request.body;

    if (!name || !crm || !cpf || !specialty || !institutionId) {
      return response.status(400).json({
        error: { message: "os parâmetros não atendem a requisição, falta name, crm, cpf, specialty ou institutionId" },
      });
    }

    let institutionService = container.resolve(InstitutionService);

    name = name.trim();
    crm = crm.trim();
    specialty = specialty.trim();
    cpf = cpf.trim();

    if (name.length < 3) {
      return response.status(400).json({
        error: { message: "nome muito curto, deve ter pelo menos 3 caracteres" },
      });
    } else if (name.length > 150) {
      return response.status(400).json({
        error: { message: "o parâmetro name não pode ter mais de 150 caracteres" },
      });
    }

    //valida se institutionId existe
    let existingInstitution= await institutionService.findById(institutionId, request);

    if (!existingInstitution) {
      return response.status(400).json({
        error: { message: "Id da instituição informado não existe" },
      });
    }

    //limpa formatação do cpf, deixando apenas os números
    cpf = cpf.replace(/[^\d]/g, "");

    if (!validateCpf(cpf)) {
      return response.status(400).json({
        error: { message: "CPF inválido" },
      });
    }

    const professionalDTO: IProfessionalDTO = {
      name,
      crm,
      cpf,
      specialty,
      status: true,
    };

    try {
      const professionalService = container.resolve(ProfessionalService);
      const resp = await professionalService.createProfessional(professionalDTO, institutionId, request);

      return response.status(200).jsonp(resp);
    } catch (error) {
      return response.status(400).json({ status: "error", message: "Erro ao criar profissional" });
    }
  }

  async list(request: Request, response: Response): Promise<Response> {
    try {
      const professionalService = container.resolve(ProfessionalService);
      const resp = await professionalService.list(request);
      return response.status(200).jsonp(resp);
    } catch (error) {
      return response.status(503).json({
        error: { message: "Erro ao listar profissionais" },
      });
    }
  }

  async getById(request: Request, response: Response): Promise<Response> {
    const { professionalId } = request.params;

    if (!professionalId) {
      return response.status(400).json({
        error: { message: "os parâmetros não atendem a requisição, falta professionalId" },
      });
    }

    try {
      const professionalService = container.resolve(ProfessionalService);
      const professional = await professionalService.findById(professionalId, request);

      if (!professional) {
        return response.status(400).json({
          error: { message: "Id profissional informado não existe" },
        });
      }

      return response.status(200).jsonp(professional);
    } catch (error) {
      return response.status(503).json({
        error: { message: "Erro ao buscar profissional por Id" },
      });
    }
  }

  async update(request: Request, response: Response): Promise<Response> {
    let { name, crm, cpf, specialty, institutionId } = request.body;
    const { professionalId } = request.params;

    if (!name || !crm || !cpf || !specialty || !professionalId || !institutionId) {
      return response.status(400).json({
        error: { message: "os parâmetros não atendem a requisição, falta name, crm, cpf, specialty, professionalId ou institutionId" },
      });
    }

    name = name.trim();
    crm = crm.trim();
    specialty = specialty.trim();
    cpf = cpf.trim();

    if (name.length < 3) {
      return response.status(400).json({
        error: { message: "nome muito curto, deve ter pelo menos 3 caracteres" },
      });
    } else if (name.length > 150) {
      return response.status(400).json({
        error: { message: "o parâmetro name não pode ter mais de 150 caracteres" },
      });
    }

    cpf = cpf.replace(/[^\d]/g, "");

    if (!validateCpf(cpf)) {
      return response.status(400).json({
        error: { message: "CPF inválido" },
      });
    }

    try {
      const institutionService = container.resolve(InstitutionService);
      const existingInstitution = await institutionService.findById(institutionId, request);

      if (!existingInstitution) {
        return response.status(400).json({
          error: { message: "Id da instituição informado não existe" },
        });
      }

      const professionalService = container.resolve(ProfessionalService);
      const existingProfessional = await professionalService.findById(professionalId, request);

      if (!existingProfessional) {
        return response.status(400).json(
          { status: "error", message: "Id profissional não existe" }
        );
      }

      const professionalDTO: IProfessionalDTO = {
        name,
        crm,
        cpf,
        specialty,
        status: existingProfessional.status,
      };

      const resp = await professionalService.update(professionalDTO, professionalId, institutionId, request);
      return response.status(200).jsonp(resp);
    } catch (error) {
      return response.status(503).json({
        error: { message: "Erro ao editar profissional" },
      });
    }
  }

  async updateStatus(request: Request, response: Response): Promise<Response> {
    const { professionalId } = request.params;
    const { status } = request.body;

    if (status == undefined || status == null || !professionalId) {
      return response.status(400).json({
        error: { message: "os parâmetros não atendem a requisição, falta status ou professionalId" },
      });
    }

    if (typeof status !== "boolean") {
      return response.status(400).json({
        error: { message: "o parâmetro status deve ser booleano" },
      });
    }

    try {
      const professionalService = container.resolve(ProfessionalService);
      const existingProfessional = await professionalService.findById(professionalId, request);

      if (!existingProfessional) {
        return response.status(400).json(
          { status: "error", message: "Id profissional não existe" }
        );
      }

      const resp = await professionalService.updateStatus(professionalId, status ? 1 : 0, request);
      return response.status(200).jsonp(resp);
    } catch (error) {
      return response.status(503).json({
        error: { message: "Erro ao atualizar status do profissional" },
      });
    }
  }
}

function validateCpf(cpf: string): boolean {
  cpf = cpf.replace(/[^\d]/g, "");

  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(cpf[i]) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(cpf[i]) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf[10])) return false;

  return true;
}

export { ProfessionalController };
