import { EntityBase } from "@/common/entities/base.entity";
import { User } from "@/user/entities/user.entity";
import { Column, Entity, JoinColumn, OneToOne } from "typeorm";

@Entity()
export class Settings extends EntityBase {
  @Column({ type: "varchar", length: 255, default: "" })
  openAIAPIKey: string;

  @Column({ type: "varchar", length: 255, default: "" })
  model: string;

  @Column({ type: "varchar", length: 255, default: "" })
  siteURL: string;

  @Column({ type: "varchar", length: 255, default: "" })
  consumerKey: string;

  @Column({ type: "varchar", length: 255, default: "" })
  consumerSecret: string;

  @Column({ type: "varchar", length: 300, default: "" })
  metaAccessToken: string;

  @OneToOne(() => User, {
    onDelete: "CASCADE",
  })
  @JoinColumn()
  user: User;
}
