import { EntityBase } from "@/common/entities/base.entity";
import { User } from "@/user/entities/user.entity";
import { Column, Entity, ManyToOne } from "typeorm";

@Entity()
export class Product extends EntityBase {
  @Column({ nullable: true })
  year: number;

  @Column({ nullable: true })
  partName: string;

  @Column({ nullable: true })
  model: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  price: string;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  originalPrice: number;

  @Column({ nullable: true })
  partGrade: string;

  @Column({ nullable: true })
  imageURL: string;

  @Column({ type: "simple-array", nullable: true })
  images: string[];

  @Column({ nullable: true })
  miles: string;

  @Column({ nullable: true })
  stockID: string;

  @Column({ nullable: true })
  distKM: string;

  @Column({ nullable: true })
  wooCommerceID: number;

  @Column({ nullable: true })
  wooCommerceLink: string;

  @Column({ type: "jsonb", nullable: true })
  dealer: {
    website: string;
    address: string;
    email: string;
    phone: string;
  };

  @Column({ default: true })
  isActive: boolean;

  @Column()
  source: string;

  @ManyToOne(() => User)
  user: User;
}
