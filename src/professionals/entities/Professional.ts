import {Column, CreateDateColumn, Entity, PrimaryColumn } from "typeorm";

import { v4 as uuidv4 } from "uuid";

@Entity("profissionais")
class Professional {
  @PrimaryColumn({ name: "Id" })
  id?: string;

  @Column({ name: "crm" })
  crm: string;

  @Column({ name: "nome" })
  name: string;

  @Column({ name: "cpf" })
  cpf: string;

  @Column({ name: "status" })
  status: Boolean;

  @Column({ name: "especialidade" })
  specialty: string;

  @CreateDateColumn({ name: "criado_em" })
  createdAt: Date;

  constructor() {
    if (!this.id) {
      this.id = uuidv4();
    }
  }
}

export { Professional };
