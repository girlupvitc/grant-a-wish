import { Database } from 'better-sqlite3';
import { NextFunction, Request, Response } from 'express';
import { getAuthUrl } from '../gauth';
import { getUserInfo, getWishes } from '../queries';
import { Config } from '../utils';

const homepage = (req: Request, res: Response, next: NextFunction) => {
    const config: Config = req.app.get('config file');
    const db: Database = req.app.get('db');

    console.log(req.session);

    res.render('index', {
        wishes: getWishes(),
        user: getUserInfo(db, req.session.email),
        authUrl: getAuthUrl(config)
    });
}

export default homepage;