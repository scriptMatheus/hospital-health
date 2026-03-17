import { DataSource } from "typeorm";
import { Patient } from "../entities/Patient";

interface IPatientRepository {
  save(patient: Patient, conSource: DataSource): Promise<Patient | string>;
  findById(patientId: string, conSource: DataSource): Promise<Patient | null>;
  list(conSource: DataSource): Promise<Patient[]>;
  update(patient: Patient, patientId: string, conSource: DataSource): Promise<Patient | null>;
  updateStatus(patientId: string, status: number, conSource: DataSource): Promise<Patient | null>;
}

export { IPatientRepository };
