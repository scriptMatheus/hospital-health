import { DataSource, Repository } from "typeorm";
import { InstitutionProfessional } from "../../entities/InstitutionProfessional";
import { IInstitutionProfessionalRepository } from "../IInstitutionProfessionalRepository";

class InstitutionProfessionalRepository implements IInstitutionProfessionalRepository {
  //@ts-ignore
  private repository: Repository<InstitutionProfessional>;

  async save(institutionProfessional: InstitutionProfessional, conSource: DataSource): Promise<InstitutionProfessional | string> {
    this.repository = conSource.getRepository(InstitutionProfessional);

    const created = await this.repository.save(institutionProfessional);

    await conSource.destroy();
    return created;
  }

  async updateStatus(id: string, status: Boolean, conSource: DataSource): Promise<InstitutionProfessional | null> {
    this.repository = conSource.getRepository(InstitutionProfessional);

    await this.repository.update(id, { status });

    const updated = await this.findById(id, conSource);
    await conSource.destroy();
    return updated;
  }

  async findById(id: string, conSource: DataSource): Promise<InstitutionProfessional | null> {
    this.repository = conSource.getRepository(InstitutionProfessional);

    const record = await this.repository.findOneBy({ id });

    await conSource.destroy();
    return record;
  }

  async findByInstitutionId(institutionId: string, conSource: DataSource): Promise<InstitutionProfessional[]> {
    this.repository = conSource.getRepository(InstitutionProfessional);

    const records = await this.repository.findBy({ institutionId });

    await conSource.destroy();
    return records;
  }

  async findByProfessionalId(professionalId: string, conSource: DataSource): Promise<InstitutionProfessional[]> {
    this.repository = conSource.getRepository(InstitutionProfessional);

    const records = await this.repository.findBy({ professionalId });

    await conSource.destroy();
    return records;
  }
}

export { InstitutionProfessionalRepository };
