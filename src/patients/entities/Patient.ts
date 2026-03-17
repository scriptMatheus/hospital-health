import {Column, CreateDateColumn, Entity, PrimaryColumn } from "typeorm";

import { v4 as uuidv4 } from "uuid";

@Entity("pacientes")
class Patient {
  @PrimaryColumn({ name: "Id" })
  id?: string;

  @Column({ name: "nome" })
  name: string;

  @Column({ name: "status" })
  status: Boolean;

  @Column({ name: "data_nascimento" })
  bornDate: string;

  @Column({ name: "id_profissional" })
  professionalId: string;

  @CreateDateColumn({ name: "criado_em" })
  createdAt: Date;

  constructor() {
    if (!this.id) {
      this.id = uuidv4();
    }
  }
}

export { Patient };
