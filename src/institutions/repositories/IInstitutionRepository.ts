import { DataSource } from "typeorm";
import { Institution } from "../entities/Institution";
interface IInstitutionRepository {
    save(Institution: Institution, conSource:DataSource): Promise<Institution|string>;
    findById(InstitutionId: string, conSource:DataSource): Promise<Institution|null>;
    list(conSource:DataSource): Promise<Institution[]>;
    update(Institution: Institution, InstitutionId: string, conSource:DataSource): Promise<Institution | null>;
}

export { IInstitutionRepository };