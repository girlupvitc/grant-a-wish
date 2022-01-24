import { Database } from 'better-sqlite3';
import { NextFunction, Request, Response } from 'express';
import { getAuthUrl } from '../gauth';
import { getUserInfo, getWishes } from '../queries';
import { Config } from '../utils';

const homepage = (req: Request, res: Response, next: NextFunction) => {
    const config: Config = req.app.get('config file');
    const db: Database = req.app.get('db');

    res.render('index', {
        wishes: getWishes(db, {
            min: parseInt(req.query['price-min'] as string),
            max: parseInt(req.query['price-max'] as string)
        }),
        user: getUserInfo(db, req.session.username),
        authUrl: getAuthUrl(config),
        admin: config.ADMINS.includes(req.session.username)
    });
}

export default homepage;