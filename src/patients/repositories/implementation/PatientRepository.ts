/* eslint-disable no-unused-expressions */
import { DataSource, Repository } from "typeorm";
import { Patient } from "../../entities/Patient";
import { IPatientRepository } from "../IPatientRepository";

class PatientRepository implements IPatientRepository {
  //@ts-ignore
  private patientRepository: Repository<Patient>;

  async list(conSource: DataSource): Promise<Patient[]> {
    this.patientRepository = conSource.getRepository(Patient);
    const patients = await this.patientRepository.find({
    });
    await conSource.destroy();

    return patients;
  }

  async findById(patientId: string, conSource: DataSource): Promise<Patient | null> {
    this.patientRepository = conSource.getRepository(Patient);
    const patient = await this.patientRepository.findOneBy({
      id: patientId,
    });

    await conSource.destroy();
    return patient;
  }

  async save(patient: Patient, conSource: DataSource): Promise<Patient | string> {
    this.patientRepository = conSource.getRepository(Patient);

    const newPatient = await this.patientRepository.save(patient);

    await conSource.destroy();
    return newPatient;
  }

  async update(patient: Patient, patientId: string, conSource: DataSource): Promise<Patient | null> {
    this.patientRepository = conSource.getRepository(Patient);
    await this.patientRepository.update(patientId, patient);

    //retorna atualizado
    const patientUpdated = await this.findById(patientId, conSource);
    await conSource.destroy();

    return patientUpdated;
  }

  async updateStatus(patientId: string, status: number, conSource: DataSource): Promise<Patient | null> {
    this.patientRepository = conSource.getRepository(Patient);
    await this.patientRepository.update(patientId, { status });

    //retorna atualizado
    const patientUpdated = await this.findById(patientId, conSource);
    await conSource.destroy();

    return patientUpdated;
  }
}

export { PatientRepository };
