import { connectDB } from './db/connect';
import { startApiServer } from './api/server';
import { startWebSocketServer } from './ws/WebSocketServer';
import dotenv from 'dotenv';
import { marketSession } from './api/controllers/session.controller';
import { createServer } from 'http';

dotenv.config();

async function bootstrap() {
    await connectDB();
    const app = startApiServer();
    const server = createServer(app);
    startWebSocketServer(server);

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        console.log(`🚀 Unified Server (API + WS) running on port ${PORT}`);
    });
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
        console.log("ℹMarket session was not running.");
    }

    console.log("Goodbye!");
    process.exit(0);
};

// Listen for termination signals (Ctrl+C, Docker stop, etc.)
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

bootstrap();

