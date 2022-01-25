import { Database } from 'better-sqlite3';
import { NextFunction, Request, Response } from 'express';
import { getAuthUrl } from '../gauth';
import { getUserInfo, getWishCount, getWishes } from '../queries';
import { Config } from '../utils';

const toArray = (number: number) => {
    return number.toString().split('');
}

const homepage = (req: Request, res: Response, next: NextFunction) => {
    const config: Config = req.app.get('config file');
    const db: Database = req.app.get('db');

    req.session.lastPage = 'home';
    const wishCount = getWishCount(db);

    res.render('index', {
        wishes: getWishes(db, {
            min: parseInt(req.query['price-min'] as string),
            max: parseInt(req.query['price-max'] as string)
        }),
        filtered: typeof req.query['price-min'] === 'string' || typeof req.query['price-max'] === 'string',
        user: getUserInfo(db, req.session.username),
        authUrl: getAuthUrl(config),
        admin: config.ADMINS.includes(req.session.username),
        wishCount,
        wishCountArray: toArray(wishCount)
    });
}

export default homepage;