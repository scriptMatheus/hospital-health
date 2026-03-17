import { DataSource } from "typeorm";
import { Professional } from "../entities/Professional";

interface IProfessionalRepository {
    save(professional: Professional, conSource:DataSource): Promise<Professional|string>;
    findById(professionalId: string, conSource:DataSource): Promise<Professional|null>;
    list(conSource:DataSource): Promise<Professional[]>;
    update(professional: Professional, professionalId: string, conSource:DataSource): Promise<Professional | null>;
    updateStatus(professionalId: string, status: number, conSource:DataSource): Promise<Professional | null>;
}

export { IProfessionalRepository };