import { Database } from "better-sqlite3";
import { NextFunction, Request, Response } from "express";
import { cancelOrder, getOrderDetails, stopUserCheckout } from "../../queries";
import { Config, isAdmin, PAYMENT_STATUSES } from "../../utils";

export default function handleOrderDeletion(req: Request, res: Response, next: NextFunction) {
    const db: Database = req.app.get('db');
    const config: Config = req.app.get('config file');
    if (!req.params.uuid) {
        return next(400);
    }

    const order = getOrderDetails(db, req.params.uuid);
    if (!order || req.session.username !== order.user && !isAdmin(config, req.session.username)) {
        return next(403);
    }
    if (!order || order.status === PAYMENT_STATUSES.Successful) {
        return next(400);
    }

    cancelOrder(db, req.params.uuid, order.items);
    stopUserCheckout(db, order.user);
    req.session.flash = {
        orderDeleted: true,
        ...req.session.flash
    };

    if (isAdmin(config, req.session.username)) {
        res.redirect('/admin');
    }
    else {
        res.redirect('/');
    }
}