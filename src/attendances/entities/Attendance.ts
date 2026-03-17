import {Column, CreateDateColumn, Entity, PrimaryColumn } from "typeorm";

import { v4 as uuidv4 } from "uuid";

@Entity("atendimentos")
class Attendance {
  @PrimaryColumn({ name: "Id" })
  id?: string;

  @Column({ name: "id_paciente" })
  patientId: string;

  @Column({ name: "id_profissional" })
  professionalId: string;

  @Column({ name: "data_atendimento" })
  attendanceDate: Date;

  @Column({ name: "hora_atendimento" })
  attendanceTime: string;

  @Column({ name: "descricao" })
  description?: string;

  @Column({ name: "status" })
  status: Boolean;

  @CreateDateColumn({ name: "criado_em" })
  createdAt?: Date;

  constructor() {
    if (!this.id) {
      this.id = uuidv4();
    }
  }
}

export { Attendance };