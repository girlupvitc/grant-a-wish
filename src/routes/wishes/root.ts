import { Database } from "better-sqlite3";
import { NextFunction, Request, Response } from "express";
import { getUserInfo, isValidWish } from "../../queries";
import { CartItem } from "../../utils";

const getWish = (db: Database, uuid: string): CartItem => {
    const wish = db.prepare('select title, description, price, uuid, status from wishes where uuid = ?').get(uuid);
    return wish;
}

export default function viewWish(req: Request, res: Response, next: NextFunction) {
    const db: Database = req.app.get('db');

    if (!req.params.uuid) {
        return next(400);
    }

    req.session.lastPage = `/wishes/${req.params.uuid}`;

    if (isValidWish(db, req.params.uuid)) {
        const wish = getWish(db, req.params.uuid);
        const options: Record<string, any> = {
            wish,
        };
        if (req.session.username) options.user = getUserInfo(db, req.session.username);
        res.render('wish', options);
    }
    else {
        return next(400);
    }
}