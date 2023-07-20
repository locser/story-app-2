// import UserSearchBody from './UserSearchBody.interface';

import { MessageSearchBody } from './messageSearchBody.interface';

export interface MessageSearchResult {
  hits: {
    total: any;
    hits: Array<{
      _source: MessageSearchBody;
    }>;
  };
}
