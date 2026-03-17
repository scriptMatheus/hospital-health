import { inject, injectable } from "tsyringe";
import { IInstitutionRepository } from "../repositories/IInstitutionRepository";
import { IInstitutionDTO } from "../interfaces/IInstitutionDTO";
import { Institution } from "../entities/Institution";
import { AppError } from "../../shared/errors/AppError";
import { DataSource } from "typeorm";

@injectable()
class InstitutionService {
  constructor(
    //@ts-ignore
    @inject("InstitutionRepository")
    private institutionRepository: IInstitutionRepository
  ) {}

  async list(req:any): Promise<IInstitutionDTO[]> {
    const prmNewConr = await this.defineConnection(req)

    const institutions = await this.institutionRepository.list(prmNewConr);
    return institutions;
  }

  async findById(institutionId: string, req:any): Promise<Institution|null> {
    const prmNewConr = await this.defineConnection(req)

    const institution = await this.institutionRepository.findById(institutionId,prmNewConr);
    return institution;
  }

  async createInstitution(institutionDTO: IInstitutionDTO, req:any): Promise<Institution|string> {
    const prmNewConr = await this.defineConnection(req)

    const institution = new Institution();
    institution.name = institutionDTO.name;
    institution.type = institutionDTO.type;
    institution.status = institutionDTO.status;


    try {

        const newInstitution = await this.institutionRepository.save(institution, prmNewConr);
        return newInstitution;

    } catch (error) {
        throw new AppError("Erro ao criar instituição", 400);
    }

  }

  async update(institution: Institution, institutionId: string, req:any): Promise<Institution | null> {
    const prmNewConr = await this.defineConnection(req)

    const updated = await this.institutionRepository.update(institution, institutionId, prmNewConr);
    return updated;
  }

  async updateStatus(institutionId: string, status: number, req:any): Promise<Institution | null> {
    const prmNewConr = await this.defineConnection(req)
    return this.institutionRepository.updateStatus(institutionId, status, prmNewConr);
  }

  async defineConnection(req: any): Promise<DataSource> {
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
      // console.log("CUSTOM Data Source has been initialized!");
      return customDataSource;
    } catch (err) {
      console.error("Problema ao inicializar o Data Source:", err);
      throw new AppError("Falha ao conectar com o banco de dados", 503);
    }
  }

}

export { InstitutionService };