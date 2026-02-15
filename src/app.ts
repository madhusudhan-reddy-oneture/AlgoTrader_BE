import { connectDB } from './db/connect';
import { startApiServer } from './api/server';
import { startWebSocketServer } from './ws/WebSocketServer';
import dotenv from 'dotenv';
import { marketSession } from './api/controllers/session.controller';

dotenv.config();

async function bootstrap() {
    await connectDB();
    startApiServer();
    startWebSocketServer();
}


const shutdown = async (signal: string) => {
    console.log(`\n${signal} received. Closing application...`);

    if (marketSession && marketSession.isMarketRunning()) {
        console.log("Saving Market State...");
        try {
            await marketSession.stop();
            console.log("State saved successfully.");
        } catch (err) {
            console.error("Failed to save state:", err);
        }
    } else {
        console.log("ℹ️ Market session was not running.");
    }

    console.log("Goodbye!");
    process.exit(0);
};

// Listen for termination signals (Ctrl+C, Docker stop, etc.)
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

bootstrap();

