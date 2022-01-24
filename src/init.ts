import express from 'express';
import { Liquid } from 'liquidjs';
import fs from 'fs';
import sqlite, { Database } from 'better-sqlite3';
import homepage from './routes/root';
import { getConfig } from './utils';
import { initDb } from './queries';
import gauthCallback from './routes/auth/auth_callback';
import logout from './routes/auth/logout';
import { ensureAdmin, ensureLoggedIn, errorHandler, notFound } from './middleware';
import admin from './routes/admin/root';
import bodyParser from 'body-parser';
import newWish from './routes/admin/new-wish';

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
    const sessionDb = new sqlite('storage/sessions.db');
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
    const db = sqlite('storage/osw.db');
    db.pragma('journal_mode = WAL');
    initDb(db);
    app.set('db', db);
}

const setupStatic = (app: express.Express) => {
    app.use('/static', express.static('static'));
}

const setupHomepage = (app: express.Express) => {
    app.get('/', homepage);
}

const setupAuth = (app: express.Express) => {
    app.get('/auth/google', gauthCallback);
    app.get('/auth/logout', logout);
}

const setupCart = (app: express.Express) => {
    app.use('/cart', ensureLoggedIn);
}

const setupAdmin = (app: express.Express) => {
    app.use('/admin', ensureAdmin);
    app.get('/admin', admin);
    app.post('/admin/new-wish', newWish);
}

const setupRoutes = (app: express.Express) => {
    [setupHomepage, setupAdmin, setupAuth].forEach(fn => {
        fn(app);
    })
}

const setupErrorHandler = (app: express.Express) => {
    app.use(notFound);
    app.use(errorHandler);
}

const setupMiddleware = (app: express.Express) => {
    const logger = require('express-logging')(require('logops'));
    app.use(logger);
    app.use(bodyParser.urlencoded({
        extended: false
    }));
}

export const createApp = () => {
    const app = express();

    const config = getConfig();
    app.set('config file', config);

    [initLiquid, initSessions, setupMiddleware, setupDb, setupStatic, setupRoutes, setupErrorHandler].forEach(fn => {
        fn(app);
    })

    return { config, app };
}