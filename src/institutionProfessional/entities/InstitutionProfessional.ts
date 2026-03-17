import { Column, CreateDateColumn, Entity, PrimaryColumn } from "typeorm";
import { v4 as uuidv4 } from "uuid";

@Entity("instituicao_profissional")
class InstitutionProfessional {
  @PrimaryColumn({ name: "Id" })
  id?: string;

  @Column({ name: "id_instituicao" })
  institutionId: string;

  @Column({ name: "id_profissional" })
  professionalId: string;

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

export { InstitutionProfessional };
