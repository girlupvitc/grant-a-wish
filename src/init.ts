import express from 'express';
import { Liquid } from 'liquidjs';
import fs from 'fs';
import sqlite from 'better-sqlite3';
import homepage from './routes/homepage';

const bsqlite3store = require('better-sqlite3-session-store');
const sessions = require('express-session');
const SqliteStore = bsqlite3store(sessions);

const initLiquid = (app: express.Express) => {
    const engine = new Liquid();
    app.engine('liquid', engine.express());
    app.set('views', './templates');
    app.set('view engine', 'liquid');
}

const initSessions = (app: express.Express) => {
    const config = app.get('config file');
    const sessionDb = new sqlite('sessions.db');
    sessionDb.pragma('journal_mode = WAL');

    app.use(sessions({
        secret: config.OSW_SECRET,
        resave: false,
        saveUninitialized: false,
        store: new SqliteStore({
            client: sessionDb,
        })
    }));
}

const setupDb = (app: express.Express) => {
    const database = sqlite('osw.db');
    database.pragma('journal_mode = WAL');
    app.set('db', database);
}

const setupStatic = (app: express.Express) => {
    app.use('/static', express.static('static'));
}

const getConfig = () => {
    let config;
    try {
        config = JSON.parse(fs.readFileSync('config.json', 'utf-8'));
    }
    catch (e) {
        console.error(`Error reading config file: ${e}`);
        process.exit(1);
    }

    return config;
}

const setupHomepage = (app: express.Express) => {
    app.get('/', homepage);
}

const setupRoutes = (app: express.Express) => {
    [setupHomepage].forEach(fn => {
        fn(app);
    })
}

export const createApp = () => {
    const app = express();
    const config = getConfig();
    app.set('config file', config);

    [initLiquid, initSessions, setupDb, setupStatic, setupRoutes].forEach(fn => {
        fn(app);
    })

    return { config, app };
}