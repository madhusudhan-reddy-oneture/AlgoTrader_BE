import { connectDB } from './db/connect';
import { startApiServer } from './api/server';
import { startWebSocketServer } from './ws/WebSocketServer';
import dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
    await connectDB();
    startApiServer();
    startWebSocketServer();
}

bootstrap();

