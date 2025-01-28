import { EntityBase } from '@/common/entities/base.entity';
import { User } from '@/user/entities/user.entity';
import { Entity, Column, ManyToOne } from 'typeorm';

@Entity()
export class ChatDocument extends EntityBase {
  @Column({ type: 'json', nullable: true })
  messages: Record<string, any>[];

  @ManyToOne(() => User)
  user: User;
}
