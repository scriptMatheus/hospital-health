/* eslint-disable no-unused-expressions */
import { DataSource, getRepository, Repository } from "typeorm";
import { Professional } from "../../entities/Professional";
import { IProfessionalRepository } from "../IProfessionalRepository";

class ProfessionalRepository implements IProfessionalRepository {
    //@ts-ignore
    private professionalRepository: Repository<Professional>;

    async list(conSource:DataSource): Promise<Professional[]> {
        this.professionalRepository = conSource.getRepository(Professional);
        const professionals = await this.professionalRepository.find({
        })
        await conSource.destroy();

        return professionals;
    }

    async findById(professionalId: string, conSource:DataSource): Promise<Professional|null> {
        this.professionalRepository = conSource.getRepository(Professional);
        const professional = await this.professionalRepository.findOneBy({
            id: professionalId,
        }) 

        await conSource.destroy();
        return professional;
    }

    async save(professional: Professional, conSource:DataSource): Promise<Professional|string> {
        this.professionalRepository = conSource.getRepository(Professional);

        const newProfessional = await this.professionalRepository.save(professional);

        await conSource.destroy();
        return newProfessional;
    }


    async update(professional: Professional, professionalId: string, conSource:DataSource): Promise<Professional | null> {
        this.professionalRepository = conSource.getRepository(Professional);
        await this.professionalRepository.update(professionalId, professional);

        //retorna atualizado
        const professionalUpdated = await this.findById(professionalId, conSource);
        await conSource.destroy();

        return professionalUpdated;
    }

    async updateStatus(professionalId: string, status: number, conSource:DataSource): Promise<Professional | null> {
        this.professionalRepository = conSource.getRepository(Professional);
        await this.professionalRepository.update(professionalId, { status });

        //retorna atualizado
        const professionalUpdated = await this.findById(professionalId, conSource);
        await conSource.destroy();
        return professionalUpdated;

    }
}

export { ProfessionalRepository };