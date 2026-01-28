import { SmartAPI } from 'smartapi-javascript';
import { AngelCredentials } from './types';

export async function getAngelFeedToken(creds: AngelCredentials) {

    const api = new SmartAPI({
        api_key: creds.apiKey, // "omT0j1lA"
    })

    const session = await api.generateSession(
        creds.clientId, //"A768340",
        creds.password,  //"8430",
        creds.totp
    );

    if (!session || !session.data || !session.data.feedToken) {
        console.error("Failed to generate feed token. Session:", session);
        throw new Error(
            "Could not generate feed token. Check API Key, Client ID, Password, and TOTP."
        );
    }

    console.log("Feed Token generated:", session.data.feedToken);

    return session.data;
}

