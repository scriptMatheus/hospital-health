import { inject, injectable } from "tsyringe";
import { DataSource } from "typeorm";
import { IPatientRepository } from "../repositories/IPatientRepository";
import { IPatientDTO } from "../interfaces/IPatientDTO";
import { Patient } from "../entities/Patient";
import { AppError } from "../../shared/errors/AppError";

@injectable()
class PatientService {
  constructor(
    //@ts-ignore
    @inject("PatientRepository")
    private patientRepository: IPatientRepository
  ) {}

  async list(req: any): Promise<Patient[]> {
    const prmNewCon = await this.defineConnection(req);
    return this.patientRepository.list(prmNewCon);
  }

  async findById(patientId: string, req: any): Promise<Patient | null> {
    const prmNewCon = await this.defineConnection(req);
    return this.patientRepository.findById(patientId, prmNewCon);
  }

  async createPatient(dto: IPatientDTO, req: any): Promise<Patient | string> {
    const prmNewCon = await this.defineConnection(req);

    const patient = new Patient();
    patient.name = dto.name;
    patient.bornDate = dto.bornDate;
    patient.professionalId = dto.professionalId;
    patient.status = dto.status;

    try {
      return await this.patientRepository.save(patient, prmNewCon);
    } catch (error) {
      throw new AppError("Erro ao criar paciente", 400);
    }
  }

  async update(dto: IPatientDTO, patientId: string, req: any): Promise<Patient | null> {
    const prmNewCon = await this.defineConnection(req);
    return this.patientRepository.update(dto as Patient, patientId, prmNewCon);
  }

  async updateStatus(patientId: string, status: number, req: any): Promise<Patient | null> {
    const prmNewCon = await this.defineConnection(req);
    return this.patientRepository.updateStatus(patientId, status, prmNewCon);
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
      return customDataSource;
    } catch (err) {
      console.error("Problema ao inicializar o Data Source:", err);
      throw new AppError("Falha ao conectar com o banco de dados", 503);
    }
  }
}

export { PatientService };
