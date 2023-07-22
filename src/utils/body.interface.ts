export interface MessageBody {
  // form message create a new message
  conversation_id: number;
  type: number;
  message: string;
  status: number;
}
