import { EntityBase } from "@/common/entities/base.entity";
import { Column, Entity } from 'typeorm';

@Entity()
export class AuthToken extends EntityBase {
  @Column()
  type: string;

  @Column()
  token: string;

  @Column()
  identifier: string;

  @Column()
  TTL: Date;
}
