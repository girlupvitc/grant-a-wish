import { Database } from "better-sqlite3";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { deleteOrder, getOrderDetails, getUserCart, isPendingOrder, setCartStatus, setOrderStatus, setUserCart } from "../queries";
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

export default async function handlePayment(req: Request, res: Response, next: NextFunction) {
    const db: Database = req.app.get('db');
    const config: Config = req.app.get('config file');

    const cart = getUserCart(db, req.session.username);
    const options: Record<string, any> = {
        orderId: req.body.orderId,
    }

    if (!cart || !req.body.orderId) return next(StatusCodes.BAD_REQUEST);

    const cancelOrder = () => {
        setCartStatus(db, cart, PAYMENT_STATUSES.Available);
        deleteOrder(db, req.body.orderId);
    }

    if (!req.body.orderId || !isPendingOrder(db, req.body.orderId)) {
        cancelOrder();
        return next(StatusCodes.BAD_REQUEST);
    }

    const orderDetails = getOrderDetails(db, req.body.orderId);

    if (!req.body.ok) {
        cancelOrder();
        options.err = JSON.stringify(req.body.err);
    }
    else {
        if (!verifySignature(req.body.razorpayId, req.body.paymentId, req.body.signature, config)) {
            cancelOrder();
            return next(StatusCodes.BAD_REQUEST);
        }
        setCartStatus(db, cart, PAYMENT_STATUSES.Successful);
        setUserCart(db, req.session.username, []);
        setOrderStatus(db, req.body.orderId, PAYMENT_STATUSES.Successful);
    }

    if (typeof options.err === 'string') {
        options.err = JSON.parse(options.err);
        options.errString = JSON.stringify(options.err, undefined, 4);
    }
    res.render('payment', {
        orderId: req.body.orderId,
        paymentId: req.body.paymentId,
        amount: orderDetails.amount,
        reason: options?.err?.error?.description,
        success: !(options.err),
        ...options
    });
}