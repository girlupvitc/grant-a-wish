import { Database } from "better-sqlite3";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { getGrantedWishes, getUserInfo, getUsername } from "../queries";

export default function cart(req: Request, res: Response, next: NextFunction) {
    if (!req.params.uuid) return next(StatusCodes.BAD_REQUEST);

    const db: Database = req.app.get('db');
    const granted = getGrantedWishes(db, req.params.uuid);

    req.session.lastPage = 'profile';

    res.render('cart', {
        user: getUserInfo(db, getUsername(db, req.params.uuid)),
        granted
    })

    next();
}