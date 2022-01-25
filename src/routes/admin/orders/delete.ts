import { Database } from "better-sqlite3";
import { NextFunction, Request, Response } from "express";
import { cancelOrder, getOrderDetails, stopUserCheckout } from "../../../queries";
import { PAYMENT_STATUSES } from "../../../utils";

export default function handleOrderDeletion(req: Request, res: Response, next: NextFunction) {
    const db: Database = req.app.get('db');
    if (!req.params.uuid) {
        return next(400);
    }

    const order = getOrderDetails(db, req.params.uuid);
    if (!order || order.status === PAYMENT_STATUSES.Successful) {
        return next(400);
    }

    cancelOrder(db, req.params.uuid, order.items);
    stopUserCheckout(db, order.user);
    req.session.flash = {
        orderDeleted: true,
        ...req.session.flash
    };

    res.redirect('/admin');
}