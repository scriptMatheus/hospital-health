import { Column, CreateDateColumn, Entity, PrimaryColumn } from "typeorm";

import { v4 as uuidv4 } from "uuid";

@Entity("instituicoes")
class Institution {
  @PrimaryColumn({ name: "Id" })
  id?: string;

  @Column({ name: "nome" })
  name: string;

  @Column({ name: "tipo" }) //0 clinica 1 hospital 2 laboratorio
  type: Number;

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

export { Institution };
