import { EntityBase } from '@/common/entities/base.entity';
import { User } from '@/user/entities/user.entity';
import { Entity, Column, ManyToOne } from 'typeorm';

@Entity()
export class ScrapingDocument extends EntityBase {
  @Column({ type: 'text', nullable: true })
  pageContent: string;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'varchar', length: 255, nullable: true })
  source: string;

  @ManyToOne(() => User)
  user: User;
}
