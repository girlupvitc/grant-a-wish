import { Database } from "better-sqlite3";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { deleteWish, getWish } from "../../../queries";
import { PAYMENT_STATUSES } from "../../../utils";

export default function handleWishDeletion(req: Request, res: Response, next: NextFunction) {
    const db: Database = req.app.get('db');
    if (!req.params.uuid) {
        return next({
            code: StatusCodes.BAD_REQUEST,
            msg: "Invalid wish or order ID supplied."
        });
    }

    const wish = getWish(db, req.params.uuid);
    if (!wish || wish.status === PAYMENT_STATUSES.Successful) {
        return next({
            code: StatusCodes.BAD_REQUEST,
            msg: "This wish has already been fulfilled."
        });
    }

    deleteWish(db, req.params.uuid);
    req.session.flash = {
        wishDeleted: true,
        ...req.session.flash
    };

    res.redirect('/admin');
}