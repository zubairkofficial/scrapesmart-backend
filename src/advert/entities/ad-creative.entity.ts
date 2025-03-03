import { EntityBase } from "@/common/entities/base.entity";
import { User } from "@/user/entities/user.entity";
import { Column, Entity, ManyToOne } from "typeorm";
import { ECampaign } from "./campaign.entity";

@Entity({ name: "adcreative" })
export class EAdCreative extends EntityBase {
  @Column({ unique: true, nullable: false })
  metaID: string;

  @Column()
  name: string;

  @Column({
    type: "jsonb",
  })
  object_story_spec: {
    page_id: string;
    link_data: {
      image_hash: string;
      link: string;
      message: string;
      call_to_action: {
        type: string;
        value: {
          link: string;
        };
      };
    };
  };

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => ECampaign, {
    onDelete: "CASCADE",
  })
  campaign: ECampaign;
}
