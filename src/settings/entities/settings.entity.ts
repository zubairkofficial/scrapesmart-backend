import { EntityBase } from "@/common/entities/base.entity";
import { Column, Entity } from "typeorm";

@Entity()
export class Settings extends EntityBase {
  @Column({ type: "varchar", length: 255, default: "" })
  openAIAPIKey: string;

  @Column({ type: "varchar", length: 255, default: "" })
  adAccountID: string;

  @Column({ type: "varchar", length: 255, default: "" })
  model: string;
}
