import { EntityBase } from '@/common/entities/base.entity';
import { User } from '@/user/entities/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class Chat extends EntityBase {
  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'json' })
  messages: IMessage[];

  @ManyToOne(() => User)
  user: User;
}
