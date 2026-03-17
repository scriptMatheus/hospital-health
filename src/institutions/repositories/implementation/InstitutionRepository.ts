/* eslint-disable no-unused-expressions */
import { DataSource, getRepository, Repository, UpdateResult } from "typeorm";
import { Institution } from "../../entities/Institution";
import { IInstitutionRepository } from "../IInstitutionRepository";

class InstitutionRepository implements IInstitutionRepository {
    //@ts-ignore
    private institutionRepository: Repository<Institution>;

    async list(conSource:DataSource): Promise<Institution[]> {
        this.institutionRepository = conSource.getRepository(Institution);
        const institutions = await this.institutionRepository.find({
        })
        await conSource.destroy();

        return institutions;
    }

    async findById(institutionId: string, conSource:DataSource): Promise<Institution|null> {
        this.institutionRepository = conSource.getRepository(Institution);
        const institution = await this.institutionRepository.findOneBy({
            id: institutionId,
        }) 

        await conSource.destroy();
        return institution;
    }

    async save(institution: Institution, conSource:DataSource): Promise<Institution|string> {
        this.institutionRepository = conSource.getRepository(Institution);

        const newInstitution = await this.institutionRepository.save(institution);

        await conSource.destroy();
        return newInstitution;
    }


    async update(institution: Institution, institutionId: string, conSource:DataSource): Promise<Institution | null> {
        this.institutionRepository = conSource.getRepository(Institution);
        await this.institutionRepository.update(institutionId, institution);

        //retorna atualizado
        const institutionUpdated = await this.findById(institutionId, conSource);
        await conSource.destroy();

        return institutionUpdated;
    }

    async updateStatus(institutionId: string, status: number, conSource:DataSource): Promise<Institution | null> {
        this.institutionRepository = conSource.getRepository(Institution);
        await this.institutionRepository.update(institutionId, { status });

        //retorna atualizado
        const institutionUpdated = await this.findById(institutionId, conSource);
        await conSource.destroy();
        return institutionUpdated;
    }

}

export { InstitutionRepository };