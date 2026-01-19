declare module 'smartapi-javascript' {
    export class SmartAPI {
        constructor(config: { api_key: string });
        generateSession(
            clientId: string,
            password: string,
            totp: string
        ): Promise<{ data: { feedToken: string; jwtToken: string } }>;
    }
}
