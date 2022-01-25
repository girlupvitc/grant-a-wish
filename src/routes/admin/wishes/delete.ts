import { Database } from "better-sqlite3";
import { NextFunction, Request, Response } from "express";
import { deleteWish, getWish } from "../../../queries";
import { PAYMENT_STATUSES } from "../../../utils";

export default function handleWishDeletion(req: Request, res: Response, next: NextFunction) {
    const db: Database = req.app.get('db');
    if (!req.params.uuid) {
        return next(400);
    }

    const wish = getWish(db, req.params.uuid);
    if (!wish || wish.status === PAYMENT_STATUSES.Successful) {
        return next(400);
    }

    deleteWish(db, req.params.uuid);
    req.session.flash = {
        wishDeleted: true,
        ...req.session.flash
    };

    res.redirect('/admin');
}