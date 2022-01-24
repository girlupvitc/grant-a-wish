declare module 'express-session' {
    export interface SessionData {
        [key: string]: any;
    }
}
