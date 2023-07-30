export interface Message {
  id: number;
  senderId: number;
  senderUserName: string;
  senderAvatar: string;
  recipientId: number;
  recipientUserName: string;
  recipientAvatar: string;
  content: string;
  dateRead?: Date;
  messageSent: Date;
}
