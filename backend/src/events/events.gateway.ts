import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { isAllowedCorsOrigin } from '../common/cors';

@WebSocketGateway({
  cors: {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      callback(null, isAllowedCorsOrigin(origin));
    },
    credentials: true,
  },
})
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('admin:join')
  handleAdminJoin(@ConnectedSocket() client: Socket) {
    client.join('admin');
    return { ok: true };
  }

  @SubscribeMessage('chat:join')
  handleChatJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    if (data?.conversationId) {
      client.join(`chat:${data.conversationId}`);
    }
    return { ok: true };
  }

  emitVisitorSession(session: unknown) {
    this.server.to('admin').emit('visitor:session', session);
  }

  emitVisitorEvent(event: unknown) {
    this.server.to('admin').emit('visitor:event', event);
  }

  emitChatMessage(conversationId: string, message: unknown) {
    this.server.to('admin').emit('chat:message', { conversationId, message });
    this.server.to(`chat:${conversationId}`).emit('chat:message', { conversationId, message });
  }
}
