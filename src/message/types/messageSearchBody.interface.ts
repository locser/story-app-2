export interface MessageSearchBody {
  message_id: number;
  message: string;
  conversation_id: number;
  user_id: number;
  type: number;
  status: number;
  timestamp: string;
}

// elastic Search for messages
