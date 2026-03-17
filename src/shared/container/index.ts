import { container, delay } from "tsyringe";
import { IInstitutionRepository } from "../../institutions/repositories/IInstitutionRepository";
import { InstitutionRepository } from "../../institutions/repositories/implementation/InstitutionRepository";
import { IProfessionalRepository } from "../../professionals/repositories/IProfessionalRepository";
import { ProfessionalRepository } from "../../professionals/repositories/implementation/ProfessionalRepository";
import { IInstitutionProfessionalRepository } from "../../institutionProfessional/repositories/IInstitutionProfessionalRepository";
import { InstitutionProfessionalRepository } from "../../institutionProfessional/repositories/implementation/InstitutionProfessionalRepository";
import { IPatientRepository } from "../../patients/repositories/IPatientRepository";
import { PatientRepository } from "../../patients/repositories/implementation/PatientRepository";
import { IAttendanceRepository } from "../../attendances/repositories/IAttendanceRepository";
import { AttendanceRepository } from "../../attendances/repositories/implementation/AttendanceRepository";

container.registerSingleton<IInstitutionRepository>(
    "InstitutionRepository",
    delay(() => InstitutionRepository)
);

container.registerSingleton<IProfessionalRepository>(
    "ProfessionalRepository",
    delay(() => ProfessionalRepository)
);

container.registerSingleton<IInstitutionProfessionalRepository>(
    "InstitutionProfessionalRepository",
    delay(() => InstitutionProfessionalRepository)
);

container.registerSingleton<IPatientRepository>(
    "PatientRepository",
    delay(() => PatientRepository)
);

container.registerSingleton<IAttendanceRepository>(
    "AttendanceRepository",
    delay(() => AttendanceRepository)
);