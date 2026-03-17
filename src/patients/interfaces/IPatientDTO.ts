interface IPatientDTO {
  id?: string;
  name: string;
  bornDate: string;
  professionalId: string;
  status: Boolean;
  createdAt?: Date;
}

export { IPatientDTO };
