import { Database } from "better-sqlite3";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { cancelOrder, getOrderDetails, stopUserCheckout } from "../../queries";
import { Config, isAdmin, PAYMENT_STATUSES } from "../../utils";

export default function handleOrderDeletion(req: Request, res: Response, next: NextFunction) {
    const db: Database = req.app.get('db');
    const config: Config = req.app.get('config file');
    if (!req.params.uuid) {
        return next({ code: StatusCodes.INTERNAL_SERVER_ERROR, msg: 'Invalid order ID supplied.' });
    }

    const order = getOrderDetails(db, req.params.uuid);
    if (!(
        order // order must be valid
        && (req.session.username === order.user || isAdmin(config, req.session.username)) // must be admin or the user that created the order
        && order.status !== PAYMENT_STATUSES.Successful // order must not be completed
    )) {
        return next({ code: StatusCodes.BAD_REQUEST });
    }

    cancelOrder(db, req.params.uuid, order.items);
    stopUserCheckout(db, order.user);
    req.session.flash = { orderDeleted: true, ...req.session.flash };

    if (isAdmin(config, req.session.username)) res.redirect('/admin');
    else res.redirect('/');
}