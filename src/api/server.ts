import express from 'express';
import cors from 'cors';
import apiRoutes from './routes';

export function startApiServer() {
    const app = express();

    app.use(cors());
    app.use(express.json());

    app.use('/api', apiRoutes);

    const port = 3000;
    app.listen(port, () => {
        console.log(`API server running on port ${port}`);
    });
}
