import { Database } from "better-sqlite3";
import { NextFunction, Request, response, Response } from "express";
import { createOrder, getCartItems, getUserCart, isValidCart, setCartStatus, setRazorpayOrderId } from "../../queries";
import { Config, getSubtotal, PAYMENT_STATUSES } from "../../utils";

export async function checkout(req: Request, res: Response, next: NextFunction) {
    const db: Database = req.app.get('db');
    const razorpay = req.app.get('razorpay');
    const cart = getUserCart(db, req.session.username);
    const cartItems = getCartItems(db, cart);
    const cfg: Config = req.app.get('config file');

    const options: Record<string, any> = {
        conflict: false,
        config: cfg,
    }

    if (!isValidCart(db, cart)) {
        options.conflict = true;
    }
    else {
        setCartStatus(db, cart, PAYMENT_STATUSES.Pending);
        const subTotal = getSubtotal(cartItems);
        const orderId = createOrder(db, cart, req.session.username);

        const razorPayOrderResponse = await razorpay.orders.create({
            amount: subTotal * 100 /* rupees to paise */,
            currency: 'INR',
            receipt: orderId
        });

        const razorpayId = razorPayOrderResponse.id;
        Object.assign(options, {
            subTotal: subTotal * 100, razorpayId, orderId
        });

        console.log(37, options.orderId);
        setRazorpayOrderId(db, orderId, razorpayId);
    }

    res.render('checkout', options);
}