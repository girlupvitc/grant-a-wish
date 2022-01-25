import { Database } from "better-sqlite3";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { deleteOrder, getUserCart, isPendingOrder, setCartStatus, setOrderStatus, setUserCart } from "../queries";
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

    const cart = getUserCart(db, req.session.username);

    const cancelOrder = () => {
        setCartStatus(db, cart, PAYMENT_STATUSES.Available);
        deleteOrder(db, req.body.uuid);
        res.redirect('/cart');
    }

    if (!isPendingOrder(db, req.body.orderId)) {
        cancelOrder();
        return next(StatusCodes.BAD_REQUEST);
    }

    if (!req.body.ok) {
        cancelOrder();
        return next();
    }
    else {
        if (!verifySignature(req.body.razorpayId, req.body.paymentId, req.body.signature, config)) {
            cancelOrder();
            return next(StatusCodes.BAD_REQUEST);
        }
        setCartStatus(db, cart, PAYMENT_STATUSES.Successful);
        setUserCart(db, req.session.username, []);
        setOrderStatus(db, req.body.orderId, PAYMENT_STATUSES.Successful);
        res.redirect('/');
        return next();
    }
}
