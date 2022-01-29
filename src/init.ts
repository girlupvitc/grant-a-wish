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
import addToCart from './routes/cart/add';
import cart from './routes/cart/root';
import removeFromCart from './routes/cart/remove';
import cors from 'cors';
import viewWish from './routes/wishes/root';
import Razorpay from 'razorpay';
import { checkout } from './routes/cart/checkout';
import handlePayment from './routes/payment';
import profile from './routes/profile';
import handleWishDeletion from './routes/admin/wishes/delete';
import handleOrderDeletion from './routes/cart/delete-order';

const bsqlite3store = require('better-sqlite3-session-store');
const sessions = require('express-session');
const SqliteStore = bsqlite3store(sessions);

const initLiquid = (app: express.Express) => {
    const engine = new Liquid({
        jsTruthy: true
    });
    app.engine('liquid', engine.express());
    app.set('views', './templates');
    app.set('view engine', 'liquid');
}

const initSessions = (app: express.Express) => {
    const config = app.get('config file');
    const sessionDb = new sqlite('storage/sessions.db');
    sessionDb.pragma('journal_mode = WAL');

    app.use(sessions({
        secret: config.SECRET,
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
    app.use('/payment', ensureLoggedIn);
    app.post('/payment', handlePayment);
}

const setupAuth = (app: express.Express) => {
    app.get('/auth/google', gauthCallback);
    app.get('/auth/logout', logout);
}

const setupCart = (app: express.Express) => {
    app.use('/cart', ensureLoggedIn);
    app.get('/cart', cart);
    app.get('/cart/add/:uuid', addToCart);
    app.get('/cart/remove/:uuid', removeFromCart);
    app.get('/cart/checkout', checkout);
    app.get('/cart/delete-order/:uuid', handleOrderDeletion);
}

const setupAdmin = (app: express.Express) => {
    app.use('/admin', ensureAdmin);
    app.get('/admin', admin);
    app.post('/admin/new-wish', newWish);
    app.get('/admin/wishes/delete/:uuid', handleWishDeletion);
}

const setupWishes = (app: express.Express) => {
    app.get('/wishes/:uuid', viewWish);
}

const setupProfile = (app: express.Express) => {
    app.get('/profile/:uuid', profile);
}

const setupRazorpay = (app: express.Express) => {
    const config = app.get('config file');
    const instance = new Razorpay({ key_id: config.RAZORPAY_KEY_ID, key_secret: config.RAZORPAY_KEY_SECRET });
    app.set('razorpay', instance);
}

const setupRoutes = (app: express.Express) => {
    [setupHomepage, setupAdmin, setupCart, setupAuth, setupWishes, setupProfile].forEach(fn => {
        fn(app);
    })
}

const setupErrorHandler = (app: express.Express) => {
    app.use(notFound);
    app.use(errorHandler);
}

const setupMiddleware = (app: express.Express) => {
    app.use(cors());
    const logger = require('express-logging')(require('logops'));
    app.use(logger);
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
}

export const createApp = () => {
    const app = express();

    const config = getConfig();
    app.set('config file', config);

    [initLiquid,
        setupRazorpay,
        initSessions,
        setupMiddleware,
        setupDb,
        setupStatic,
        setupRoutes,
        setupErrorHandler
    ].forEach(fn => {
        fn(app);
    })

    return { config, app };
}