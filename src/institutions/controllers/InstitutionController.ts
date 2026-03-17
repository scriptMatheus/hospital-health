import { Request, Response } from "express";
import { container } from "tsyringe";
import { InstitutionService } from "../services/InstitutionService";
import { IInstitutionDTO } from "../interfaces/IInstitutionDTO";
import axios from "axios";

class InstitutionController {
  async create(request: Request, response: Response): Promise<Response> {
    let { name, type } = request.body;

    if (!name || type == undefined || type == null) {
      return response.status(400).json({
        error: { message: "os paramentros não atendem a requisição, falta name ou type" },
      });
    }

    name = name.trim();

    if (name.length < 3) {
      return response.status(400).json({
        error: { message: "nome muito curto, deve ter pelo menos 3 caracteres" },
      });
    }else if (name.length > 100) {
      return response.status(400).json({
        error: { message: "o paramentro name não pode ter mais de 100 caracteres" },
      });
    }

    type = Number(type);

    //valida tipo de instituição 0 clinica 1 hospital 2 laboratorio
    if (type !=0 && type !== 1 && type !== 2) {
      return response.status(400).json({
        error: { message: "o paramentro type deve ser 0, 1 ou 2" },
      });
    }

    const institutionDTO: IInstitutionDTO = {
        name,
        type,
        status: true,
    };
    
    try {
      const institutionService = container.resolve(InstitutionService);
      const resp = await institutionService.createInstitution(institutionDTO, request);

      return response.status(200).jsonp(resp);

    } catch (error) {

      return response.status(400).json({ status:"error", message: "Erro ao criar Instituição"});
    }
  }

  async list(request: Request, response: Response): Promise<Response> {
    try {
      const institutionService = container.resolve(InstitutionService);
      const resp = await institutionService.list(request);
      return response.status(200).jsonp(resp);
    } catch (error) {
      return response.status(503).json({
        error: { message: "Erro ao listar instituições" },
      });
    }
  }


  async getById(request: Request, response: Response): Promise<Response> {
    const {institutionId} = request.params;
    if (!institutionId) {
        return response.status(400).json({
          error: { message: "os paramentros não atendem a requisição!, falta institutionId" },
        });
    }

    try {
      const institutionService = container.resolve(InstitutionService);
      const institution = await institutionService.findById(institutionId, request);

      if (!institution) {
        return response.status(400).json({
          error: { message: "Id institution informado não existe" },
        });
      }

      return response.status(200).jsonp(institution);
    } catch (error) {
      return response.status(503).json({
        error: { message: "Erro ao listar por Id" },
      });
    }
  }

  async update(request: Request, response: Response): Promise<Response> {

    let { name } = request.body;
    let { type } = request.body;
    const { institutionId } = request.params;

    if (!name || type == undefined || type == null || !institutionId) {
      return response.status(400).json({
        error: { message: "os paramentros não atendem a requisição, falta name ou type ou institutionId" },
      });
    }

    name = name.trim();

    if (name.length < 3) {
      return response.status(400).json({
        error: { message: "nome muito curto, deve ter pelo menos 3 caracteres" },
      });
    }else if (name.length > 100) {
      return response.status(400).json({
        error: { message: "o paramentro name não pode ter mais de 100 caracteres" },
      });
    }

    type = Number(type);

    //valida tipo de instituição 0 clinica 1 hospital 2 laboratorio
    if (type !=0 && type !== 1 && type !== 2) {
      return response.status(400).json({
        error: { message: "o paramentro type deve ser 0, 1 ou 2" },
      });
    }

    try {
      const institutionService = container.resolve(InstitutionService);
      const existingInstitution = await institutionService.findById(institutionId, request);

      if (!existingInstitution) {
        return response.status(400).json(
          { status: "error", message: "Id instituição não existe" }
        );
      }

      const institutionDTO: IInstitutionDTO = {
        name: name,
        type: type,
        status: existingInstitution.status,
      };

      const resp = await institutionService.update(institutionDTO, institutionId, request);
      return response.status(200).jsonp(resp);
    } catch (error) {
      return response.status(503).json({
        error: { message: "Erro ao editar instituição" },
      });
    }
  }

  async updateStatus(request: Request, response: Response): Promise<Response> {
    const { institutionId } = request.params;
    const { status } = request.body;

    if (status == undefined || status == null || !institutionId) {
      return response.status(400).json({
        error: { message: "os paramentros não atendem a requisição, falta status ou institutionId" },
      });
    }

    if (typeof status !== "boolean") {
      return response.status(400).json({
        error: { message: "o parâmetro status deve ser booleano" },
      });
    }

    try {
      const institutionService = container.resolve(InstitutionService);
      const existingInstitution = await institutionService.findById(institutionId, request);

      if (!existingInstitution) {
        return response.status(400).json(
          { status: "error", message: "Id instituição não existe" }
        );
      }

      const resp = await institutionService.updateStatus(institutionId, status ? 1 : 0, request);
      return response.status(200).jsonp(resp);
    } catch (error) {
      return response.status(503).json({
        error: { message: "Erro ao atualizar status da instituição" },
      });
    }
  }

}

export { InstitutionController };