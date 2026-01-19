import { SmartAPI } from 'smartapi-javascript';
import readline from "readline";

export async function getAngelFeedToken() {

    const api = new SmartAPI({
        api_key: process.env.APIKEY ?? "", // "omT0j1lA"
    })

    const totp = await new Promise<string>((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        rl.question("Enter current TOTP from app: ", (code) => {
            rl.close();
            resolve(code.trim());
        });
    });


    const session = await api.generateSession(
        process.env.CLIENT_ID ?? "", //"A768340",
        "8430",
        totp
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

