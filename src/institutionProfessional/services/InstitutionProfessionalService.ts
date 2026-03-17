import { inject, injectable } from "tsyringe";
import { DataSource } from "typeorm";
import { IInstitutionProfessionalRepository } from "../repositories/IInstitutionProfessionalRepository";
import { IInstitutionProfessionalDTO } from "../interfaces/IInstitutionProfessionalDTO";
import { InstitutionProfessional } from "../entities/InstitutionProfessional";
import { AppError } from "../../shared/errors/AppError";

@injectable()
class InstitutionProfessionalService {
  constructor(
    //@ts-ignore
    @inject("InstitutionProfessionalRepository")
    private institutionProfessionalRepository: IInstitutionProfessionalRepository
  ) {}

  async create(dto: IInstitutionProfessionalDTO, req: any): Promise<InstitutionProfessional | string> {
    const conexao = await this.defineConnection();

    const record = new InstitutionProfessional();
    record.institutionId = dto.institutionId;
    record.professionalId = dto.professionalId;
    record.status = dto.status;

    try {
      return await this.institutionProfessionalRepository.save(record, conexao);
    } catch (error) {
      throw new AppError("Erro ao criar vínculo instituição-profissional", 400);
    }
  }

  async updateStatus(id: string, status: Boolean, req: any): Promise<InstitutionProfessional | null> {
    const conexao = await this.defineConnection();
    return this.institutionProfessionalRepository.updateStatus(id, status, conexao);
  }

  async findById(id: string, req: any): Promise<InstitutionProfessional | null> {
    const conexao = await this.defineConnection();
    return this.institutionProfessionalRepository.findById(id, conexao);
  }

  async findByInstitutionId(institutionId: string, req: any): Promise<InstitutionProfessional[]> {
    const conexao = await this.defineConnection();
    return this.institutionProfessionalRepository.findByInstitutionId(institutionId, conexao);
  }

  async findByProfessionalId(professionalId: string, req: any): Promise<InstitutionProfessional[]> {
    const conexao = await this.defineConnection();
    return this.institutionProfessionalRepository.findByProfessionalId(professionalId, conexao);
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

export { InstitutionProfessionalService };
