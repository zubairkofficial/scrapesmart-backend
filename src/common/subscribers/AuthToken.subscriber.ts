import { AuthToken } from "@/auth/entities/AuthToken.entity";
import { EntitySubscriberInterface, EventSubscriber, InsertEvent, LessThan } from "typeorm";

@EventSubscriber()
export class AuthTokenSubscriber implements EntitySubscriberInterface<AuthToken> {
  /**
   * Indicates that this subscriber only listen to AuthToken events.
   */
  listenTo() {
    return AuthToken
  }

  /**
   * Called after insertion.
   */
  afterInsert(event: InsertEvent<AuthToken>) {
    const authTokenManager = event.manager;

    authTokenManager.getRepository(AuthToken).delete({
      TTL: LessThan(new Date())
    });
  }
}