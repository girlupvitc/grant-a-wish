import fs from 'fs';

export interface Config {
    SECRET: string,
    PORT?: number,
    ADMINS: string[],
    GOAUTH_CLIENT_ID: string,
    GOAUTH_CLIENT_SECRET: string,
    GOAUTH_REDIRECT_URI: string,
    RAZORPAY_KEY_ID: string,
    RAZORPAY_KEY_SECRET: string
}

export interface CartItem {
    uuid: string,
    description: string,
    title: string,
    price: number,
    status: number
}

export const PAYMENT_STATUSES: {
    Available: 0,
    Pending: 1,
    Successful: 2
} = {
    Available: 0,
    Pending: 1,
    Successful: 2
}

export const isAdmin = (config: Config, username: string) => {
    return config.ADMINS.includes(username);
}

export const getConfig = () => {
    try {
        const config = JSON.parse(fs.readFileSync('config.json', 'utf-8'));
        ['SECRET',
            'ADMINS',
            'GOAUTH_CLIENT_ID',
            'GOAUTH_CLIENT_SECRET',
            'GOAUTH_REDIRECT_URI',
            'RAZORPAY_KEY_ID',
            'RAZORPAY_KEY_SECRET'
        ].forEach(prop => {
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

export const getSubtotal = (items: CartItem[]) => {
    return items.reduce((prev, current) => {
        return prev + current.price;
    }, 0);
}

export const die = (msg: any, code = 1) => {
    console.error(msg);
    process.exit(code);
}

export const mapFlashes = (flash: Record<string, any>, flashes: string[]) => {
    const res: Record<string, boolean> = {};
    for (const key of flashes) {
        if (flash && flash[key]) {
            res[key] = true;
        }
    }

    return res;
}

export const clearFlashes = (flash: Record<string, any>, flashes: string[]) => {
    const res: Record<string, boolean> = {};
    for (const key of flashes) {
        if (flash && flash[key]) {
            delete flash[key];
        }
    }

    return res;
}
