import { EntityBase } from "@/common/entities/base.entity";
import { User } from "@/user/entities/user.entity";
import { Column, Entity, ManyToOne } from "typeorm";
import { BudgetType } from "../types";
import { ECampaign } from "./campaign.entity";

@Entity({ name: "adset" })
export class EAdset extends EntityBase {
  @Column({ unique: true, nullable: false })
  metaID: string;

  @Column()
  name: string;

  @Column({ type: "enum", enum: BudgetType, default: BudgetType.DAILY })
  budgetType: BudgetType;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  budget: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  bidAmount: number;

  @Column()
  startTime: Date;

  @Column({ nullable: true })
  endTime: Date;

  @Column()
  billingEvent: string;

  @Column()
  optimizationGoal: string;

  @Column({ type: "json" })
  targeting: {
    geo_locations: {
      countries: string[];
    };
  };

  @Column()
  status: string;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => ECampaign, {
    onDelete: "CASCADE",
  })
  campaign: ECampaign;
}
