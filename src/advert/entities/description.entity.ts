import { EntityBase } from "@/common/entities/base.entity";
import { User } from "@/user/entities/user.entity";
import { Column, Entity, ManyToOne } from "typeorm";

@Entity()
export class Description extends EntityBase {
  @Column({ type: "uuid", unique: true })
  productID: string;

  @Column({ type: "text" })
  description: string;

  @ManyToOne(() => User)
  user: User;
}
