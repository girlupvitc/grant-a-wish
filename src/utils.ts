import fs from 'fs';

export interface Config {
    OSW_SECRET: string,
    PORT?: number,
    ADMINS: string[],
    GOAUTH_CLIENT_ID: string,
    GOAUTH_CLIENT_SECRET: string,
    GOAUTH_REDIRECT_URI: string;
}

export interface CartItem {
    uuid: string,
    description: string,
    title: string,
    price: number
}

export const getConfig = () => {
    try {
        const config = JSON.parse(fs.readFileSync('config.json', 'utf-8'));
        ['OSW_SECRET', 'ADMINS', 'GOAUTH_CLIENT_ID', 'GOAUTH_CLIENT_SECRET', 'GOAUTH_REDIRECT_URI'].forEach(prop => {
            if (!config.hasOwnProperty(prop)) {
                die(`Missing required config property ${prop}`);
            }
        })

        return config;
    }
    catch (e) {
        die(`Error reading config file: ${e}`);
    }
}

export const die = (msg: any, code = 1) => {
    console.error(msg);
    process.exit(code);
}
