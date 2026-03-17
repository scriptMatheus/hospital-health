interface IAttendanceDTO {
  id?: string;
  patientId: string;
  professionalId: string;
  attendanceDate: string;
  attendanceTime: string;
  description?: string;
  status: Boolean;
  createdAt?: Date;
}

export { IAttendanceDTO };
