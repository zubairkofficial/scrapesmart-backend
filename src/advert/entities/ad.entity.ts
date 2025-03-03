import { EntityBase } from "@/common/entities/base.entity";
import { User } from "@/user/entities/user.entity";
import { Column, Entity, ManyToOne } from "typeorm";
import { EAdCreative } from "./ad-creative.entity";
import { EAdset } from "./adset.entity";

@Entity({ name: "ad" })
export class EAd extends EntityBase {
  @Column({ unique: true, nullable: false })
  metaID: string;

  @Column()
  name: string;

  @Column()
  status: string;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => EAdCreative)
  adCreative: EAdCreative;

  @ManyToOne(() => EAdset, {
    onDelete: "CASCADE",
  })
  adSet: EAdset;
}
