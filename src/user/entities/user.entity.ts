import { Chat } from "@/chat/entities/chat.entity";
import { EntityBase } from '@/common/entities/base.entity';
import { generatePasswordHash } from '@/common/utils/bcrypt';
import { Settings } from "@/settings/entities/settings.entity";
import { BeforeInsert, Column, Entity, OneToMany } from 'typeorm';

@Entity()
export class User extends EntityBase {
  @Column({ type: 'varchar' })
  firstName: string;

  @Column({ type: 'varchar' })
  lastName: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'boolean', default: false })
  isEmailVerified: boolean;

  @OneToMany(() => Chat, (chat) => chat.user)
  chats: Promise<Chat[]>;

  @OneToMany(() => Settings, (settings) => settings.user)
  settings: Promise<Settings[]>;

  @BeforeInsert()
  beforeInsert() {
    this.password = generatePasswordHash(this.password);
  }
}
