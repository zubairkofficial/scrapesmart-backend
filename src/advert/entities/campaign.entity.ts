import { EntityBase } from "@/common/entities/base.entity";
import { User } from "@/user/entities/user.entity";
import { Column, Entity, ManyToOne } from "typeorm";

@Entity({ name: "campaign" })
export class ECampaign extends EntityBase {
  @Column({ unique: true, nullable: false })
  metaID: string;

  @Column({ type: "varchar", length: 255 })
  name: string;

  @Column({ type: "varchar", length: 255 })
  special_ad_categories: string;

  @Column({ type: "varchar", length: 255 })
  status: string;

  @Column({ type: "varchar", length: 255 })
  objective: string;

  @ManyToOne(() => User)
  user: User;
}
