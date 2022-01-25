import { Database } from "better-sqlite3";
import { NextFunction, Request, Response } from "express";
import { getUserInfo, getWish, isValidWish } from "../../queries";
import { Config } from "../../utils";

export default function viewWish(req: Request, res: Response, next: NextFunction) {
    const db: Database = req.app.get('db');

    if (!req.params.uuid) {
        return next(400);
    }

    const config: Config = req.app.get('config file');
    const isAdmin = config.ADMINS.includes(req.session.username);

    if (isValidWish(db, req.params.uuid)) {
        req.session.lastPage = `/wishes/${req.params.uuid}`;
        const wish = getWish(db, req.params.uuid);
        if (!wish) return next(400);
        const options: Record<string, any> = {
            wish, isAdmin
        };
        if (req.session.username) options.user = getUserInfo(db, req.session.username);
        res.render('wish', options);
    }
    else {
        return next(400);
    }
}