import { OnGatewayInit } from '@nestjs/websockets';
import { Server } from 'socket.io';
export declare class EventsGateway implements OnGatewayInit {
    server: Server;
    afterInit(server: Server): void;
    broadcastEmergency(report: any): void;
}
