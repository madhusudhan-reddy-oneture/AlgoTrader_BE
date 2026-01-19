import { Request, Response } from 'express';

export class LoginController {

    static async login(req: Request, res: Response) {
        try {
            const { apiKey, clientId, password, totp } = req.body;

            if (!clientId || !totp) {
                return res.status(400).json({
                    message: 'clientId and totp are required'
                });
            }

            // ⚠️ Sets ENV variables (process-wide)
            process.env.APIKEY = clientId;
            process.env.CLIENT_ID = clientId;
            process.env.PASSWORD = password;
            process.env.TOTP = totp;

            console.log('Client credentials set');

            return res.json({
                success: true,
                message: 'Login credentials stored successfully'
            });

        } catch (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                message: 'Login failed'
            });
        }
    }
}
