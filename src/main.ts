import express from 'express';
import 'dotenv/config';
import sqlite from 'better-sqlite3';
import { Liquid } from 'liquidjs';

const bsqlite3store = require('better-sqlite3-session-store');
const sessions = require('express-session');

const app = express();
const SqliteStore = bsqlite3store(sessions);
const sessionDb = new sqlite('sessions.db');
const engine = new Liquid();

// register liquid engine
app.engine('liquid', engine.express());
app.set('views', './templates');
app.set('view engine', 'liquid');

declare module 'express-session' {
    export interface SessionData {
        [key: string]: any;
    }
}

app.use(sessions({
    secret: process.env.OSW_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new SqliteStore({
        client: sessionDb,
    })
}));

app.use('/static', express.static('static'));

const getWishes = () => {
    return [{
        title: 'test',
        description: 'testing a description',
        uuid: '1c895980-9b0c-481e-a985-b16a02a3ce0b',
        price: 999
    },
    {
        title: 'second wish',
        description: 'testing another description',
        uuid: '294bf280-f93f-417b-b492-29898183792f',
        price: 499
    }]
}

app.get('/', (req, res, next) => {
    res.render('index', {
        wishes: getWishes()
    });
})

const port = process.env.OSW_PORT || 3000;

app.listen(port, () => {
    console.log(`listening on port ${port}`);
})