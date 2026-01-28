import multer from 'multer';
import { MarketSession } from './../../session/MarketSession';
import { Request, Response } from "express";
import path from 'path';
import fs from 'fs';

export const marketSession = new MarketSession();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../../../config/bhav');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },

    filename: (req, file, cb) => {
        if (file.fieldname === 'nse') {
            cb(null, 'NSE_BhavCopy.csv');
        } else if (file.fieldname === 'bse') {
            cb(null, 'BSE_BhavCopy.csv');
        } else {
            cb(null, file.originalname);
        }
    }
});

const upload = multer({ storage });

export class SessionController {

    static uploadMiddleware = upload.fields([
        { name: 'nse', maxCount: 1 },
        { name: 'bse', maxCount: 1 }
    ]);

    static async startSession(req: Request, res: Response) {
        try {
            const { apiKey, clientId, password, totp } = req.body; if (!clientId || !totp || !password || !apiKey) {
                return res.status(400).json({ message: 'All credentials (clientId, password, apiKey, totp) are required' });
            }

            if (marketSession.isMarketRunning()) {
                return res.status(400).json({ message: 'Session is already running' });
            }

            await marketSession.start({ apiKey, clientId, password, totp });

            res.json({ message: "Market session started successfully" });
        }
        catch (err: any) {
            console.error(err);
            res.status(500).json({ message: 'Failed to start session', error: err.message });
        }
    }

    static async stopSession(req: Request, res: Response) {
        try {
            await marketSession.stop();
            res.json({ message: 'Market session stopped' });
        } catch (err: any) {
            console.error(err);
            res.status(500).json({ message: 'Failed to stop session', error: err.message });
        }
    }

    static getStatus(req: Request, res: Response) {
        res.json({
            running: marketSession.isMarketRunning()
        });
    }

    static async uploadBhavCopy(req: Request, res: Response) {
        try {
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };

            if (!files['nse'] && !files['bse']) {
                return res.status(400).json({ message: 'No files uploaded' });
            }

            res.json({
                success: true,
                message: 'BhavCopy files updated successfully',
                details: {
                    nse: files['nse'] ? 'Updated' : 'Unchanged',
                    bse: files['bse'] ? 'Updated' : 'Unchanged'
                }
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'File upload failed' });
        }
    }


}