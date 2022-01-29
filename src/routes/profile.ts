import { Database } from "better-sqlite3";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { getGrantedWishes, getPendingOrder, getUserInfo, getUsername } from "../queries";

export default function profile(req: Request, res: Response, next: NextFunction) {
    if (!req.params.uuid) return next({
        code: StatusCodes.BAD_REQUEST,
        msg: 'Invalid or no profile ID supplied.'
    });

    const db: Database = req.app.get('db');
    const username = getUsername(db, req.params.uuid);
    if (!username) return next({
        code: StatusCodes.BAD_REQUEST,
        msg: 'Invalid profile ID supplied.'
    });
    const granted = getGrantedWishes(db, username);
    const pendingOrder = getPendingOrder(db, req.session.username);

    req.session.lastPage = 'profile';

    res.render('profile', {
        loggedInUser: getUserInfo(db, req.session.username),
        user: getUserInfo(db, username),
        granted,
        pendingOrder
    })
}