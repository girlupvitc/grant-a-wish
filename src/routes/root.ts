import { Database } from 'better-sqlite3';
import { NextFunction, Request, Response } from 'express';
import { getAuthUrl } from '../gauth';
import { getUserInfo, getWishCount, getWishes } from '../queries';
import { clearFlashes, Config, isAdmin, mapFlashes } from '../utils';

const toArray = (number: number) => {
    return number.toString().split('');
}

const homepage = (req: Request, res: Response, next: NextFunction) => {
    const config: Config = req.app.get('config file');
    const db: Database = req.app.get('db');

    req.session.lastPage = 'home';
    const wishCount = getWishCount(db);

    const filters = {
        min: parseInt(req.query['price-min'] as string),
        max: parseInt(req.query['price-max'] as string)
    }

    res.render('index', {
        authUrl: getAuthUrl(config),
        admin: isAdmin(config, req.session.username),
        filtered: !!(filters.min || filters.max),
        user: getUserInfo(db, req.session.username),
        wishCount,
        wishCountArray: toArray(wishCount),
        wishes: getWishes(db, filters),
        ...mapFlashes(req.session.flash, ['orderDeleted'])
    });

    clearFlashes(req.session.flash, ['orderDeleted']);
}

export default homepage;