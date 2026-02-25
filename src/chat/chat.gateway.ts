import { WebSocketGateway, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway {
  constructor(private readonly chatService: ChatService) {}

  @SubscribeMessage('sendMessage')
  async handleMessage(@MessageBody() data: { userId: string; roomId: string; content: string }) {
    return this.chatService.sendMessage(data.userId, data.roomId, data.content);
  }

  @SubscribeMessage('getMessages')
  async handleGetMessages(@MessageBody() roomId: string) {
    return this.chatService.getMessages(roomId);
  }
}
