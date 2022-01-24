import fs from 'fs';

export interface Config {
    OSW_SECRET: string,
    PORT?: number
}

export const getConfig = () => {
    try {
        const config = JSON.parse(fs.readFileSync('config.json', 'utf-8'));
        ['OSW_SECRET'].forEach(prop => {
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
