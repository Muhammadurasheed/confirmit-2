import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/receipts',
})
export class ReceiptsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ReceiptsGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(client: Socket, receiptId: string) {
    client.join(receiptId);
    this.logger.log(`Client ${client.id} subscribed to receipt ${receiptId}`);
  }

  emitProgress(receiptId: string, progress: number, status: string, p0: string) {
    this.server.to(receiptId).emit('progress', {
      receipt_id: receiptId,
      progress,
      status,
      timestamp: new Date().toISOString(),
    });
  }

  emitComplete(receiptId: string, data: any) {
    this.server.to(receiptId).emit('complete', {
      receipt_id: receiptId,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  emitError(receiptId: string, error: string) {
    this.server.to(receiptId).emit('error', {
      receipt_id: receiptId,
      error,
      timestamp: new Date().toISOString(),
    });
  }
}
