import { EntityBase } from '@/common/entities/base.entity';
import { generatePasswordHash } from '@/common/utils/bcrypt';
import { BeforeInsert, Column, Entity } from 'typeorm';

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

  @Column({ type: 'tinyint', default: false })
  isEmailVerified: boolean;

  @BeforeInsert()
  beforeInsert() {
    this.password = generatePasswordHash(this.password);
  }
}
