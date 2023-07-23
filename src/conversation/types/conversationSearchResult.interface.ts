// import UserSearchBody from './UserSearchBody.interface';

import { ConversaitonSearchBody } from './conversationSearchBody.interface';

export interface UserSearchResult {
  hits: {
    total: number;
    hits: Array<{
      _source: ConversaitonSearchBody;
    }>;
  };
}
