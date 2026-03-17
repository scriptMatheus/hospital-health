import { DataSource } from "typeorm";
import { InstitutionProfessional } from "../entities/InstitutionProfessional";

interface IInstitutionProfessionalRepository {
  save(institutionProfessional: InstitutionProfessional, conSource: DataSource): Promise<InstitutionProfessional | string>;
  updateStatus(id: string, status: Boolean, conSource: DataSource): Promise<InstitutionProfessional | null>;
  findById(id: string, conSource: DataSource): Promise<InstitutionProfessional | null>;
  findByInstitutionId(institutionId: string, conSource: DataSource): Promise<InstitutionProfessional[]>;
  findByProfessionalId(professionalId: string, conSource: DataSource): Promise<InstitutionProfessional[]>;
}

export { IInstitutionProfessionalRepository };
