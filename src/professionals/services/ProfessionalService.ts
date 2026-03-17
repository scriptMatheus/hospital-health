import { container, inject, injectable } from "tsyringe";
import { DataSource } from "typeorm";
import { IProfessionalRepository } from "../repositories/IProfessionalRepository";
import { IProfessionalDTO } from "../interfaces/ProfessionalDTO";
import { Professional } from "../entities/Professional";
import { AppError } from "../../shared/errors/AppError";
import { InstitutionService } from "../../institutions/services/InstitutionService";
import { IInstitutionProfessionalDTO } from "../../institutionProfessional/interfaces/IInstitutionProfessionalDTO";
import { InstitutionProfessional } from "../../institutionProfessional/entities/InstitutionProfessional";
import { InstitutionProfessionalService } from "../../institutionProfessional/services/InstitutionProfessionalService";
import { request } from "https";

@injectable()
class ProfessionalService {
  constructor(
    //@ts-ignore
    @inject("ProfessionalRepository")
    private professionalRepository: IProfessionalRepository
  ) {}

  async list(req: any): Promise<Professional[]> {
    const prmNewCon = await this.defineConnection();
    return this.professionalRepository.list(prmNewCon);
  }

  async findById(professionalId: string, req: any): Promise<Professional | null> {
    const prmNewCon = await this.defineConnection();
    return this.professionalRepository.findById(professionalId, prmNewCon);
  }

  async createProfessional(dto: IProfessionalDTO, institutionId: string, req: any): Promise<Professional | string> {
    const prmNewCon  = await this.defineConnection();

    const profissional = new Professional();
    profissional.name = dto.name;
    profissional.crm = dto.crm;
    profissional.cpf = dto.cpf;
    profissional.specialty = dto.specialty;
    profissional.status = dto.status;

    try {
      let ret = await this.professionalRepository.save(profissional, prmNewCon);

        const institutionProfessionalService = container.resolve(InstitutionProfessionalService);

        //cria vinculo entre profissional e instituição
        try {
            let institutionProfessionalDTO: IInstitutionProfessionalDTO = {
                institutionId: institutionId,
                professionalId: String(ret.id),
                status: true,
            }

            let institutionProfessional  = await institutionProfessionalService.create(institutionProfessionalDTO, req);
            
            return ret;

        } catch (error) {
        
            throw new AppError("Erro ao criar vínculo entre profissional e instituição", 400);
        }
      

    } catch (error) {
      throw new AppError("Erro ao criar profissional", 400);
    }
  }

  async update(dto: IProfessionalDTO, professionalId: string, institutionId: string, req: any): Promise<Professional | null> {
    const prmNewCon = await this.defineConnection();

    const updated = await this.professionalRepository.update(dto as Professional, professionalId, prmNewCon);

    // atualiza vínculo: desativa vínculos anteriores e cria novo com a nova instituição
    const institutionProfessionalService = container.resolve(InstitutionProfessionalService);

    const vinculosAntigos = await institutionProfessionalService.findByProfessionalId(professionalId, req);
    for (const vinculo of vinculosAntigos) {
      await institutionProfessionalService.updateStatus(String(vinculo.id), false, req);
    }

    const institutionProfessionalDTO: IInstitutionProfessionalDTO = {
      institutionId,
      professionalId,
      status: true,
    };
    await institutionProfessionalService.create(institutionProfessionalDTO, req);

    return updated;
  }

  async updateStatus(professionalId: string, status: number, req: any): Promise<Professional | null> {
    const prmNewCon = await this.defineConnection();
    return this.professionalRepository.updateStatus(professionalId, status, prmNewCon);
  }

  async defineConnection(): Promise<DataSource> {
    const customDataSource = new DataSource({
      type: "mysql",
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: ["./src/**/entities/*.ts"],
      charset: process.env.DB_CHARSET,
      logging: process.env.DB_LOGGING === "true",
      synchronize: process.env.DB_SYNCHRONIZE === "true",
    });

    try {
      await customDataSource.initialize();
      return customDataSource;
    } catch (err) {
      console.error("Problema ao inicializar o Data Source:", err);
      throw new AppError("Falha ao conectar com o banco de dados", 503);
    }
  }
}

export { ProfessionalService };
