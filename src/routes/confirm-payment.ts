import { Database } from "better-sqlite3";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { deleteOrder, getUserCart, setCartStatus, setOrderStatus, setUserCart } from "../queries";
import { Config, PAYMENT_STATUSES } from "../utils";
import crypto from 'crypto';

const verifySignature = (razorpayId: string, paymentId: string, signature: string, config: Config) => {
    const body = razorpayId + '|' + paymentId;
    const generated = crypto
        .createHmac('sha256', config.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');
    return generated === signature;
}

export default async function confirmPayment(req: Request, res: Response, next: NextFunction) {
    const db: Database = req.app.get('db');
    const config: Config = req.app.get('config file');
    console.log(req.body);
    if (!isPendingOrder(db, req.body.orderId)) {
        return next(StatusCodes.BAD_REQUEST);
    }

    if (!req.body.ok) {
        const cart = getUserCart(db, req.session.username);
        setCartStatus(db, cart, PAYMENT_STATUSES.Available);
        deleteOrder(db, req.body.uuid);
        res.redirect('/cart');
        return next();
    }
    else {
        console.log('bad request?');
        if (!verifySignature(req.body.razorpayId, req.body.paymentId, req.body.signature, config)) return next(StatusCodes.BAD_REQUEST);
        const cart = getUserCart(db, req.session.username);
        setCartStatus(db, cart, PAYMENT_STATUSES.Successful);
        setUserCart(db, req.session.username, []);
        setOrderStatus(db, req.body.orderId, PAYMENT_STATUSES.Successful);
        res.redirect('/');
        return next();
    }
}

function isPendingOrder(db: Database, orderId: string) {
    console.log(orderId);
    const order = db.prepare('select uuid from orders where uuid = ? and status = ?').get(orderId, PAYMENT_STATUSES.Pending);
    console.log('******', order);
    return !!order;
}
