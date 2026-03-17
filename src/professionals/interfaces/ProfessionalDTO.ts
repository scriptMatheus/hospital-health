interface IProfessionalDTO {
    id?: string;
    name: string;
    crm: string;
    specialty: string;
    cpf: string;
    status: Boolean;
    createdAt?: Date;
}

export { IProfessionalDTO };