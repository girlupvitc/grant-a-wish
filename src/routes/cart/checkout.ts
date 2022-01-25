import { Database } from "better-sqlite3";
import { NextFunction, Request, Response } from "express";
import { createOrder, getCartItems, getUserCart, getConflictingItems, setCartStatus, setRazorpayOrderId } from "../../queries";
import { CartItem, Config, getSubtotal, PAYMENT_STATUSES } from "../../utils";
import { removeCartItem } from "./remove";

export async function checkout(req: Request, res: Response, next: NextFunction) {
    const db: Database = req.app.get('db');
    const razorpay = req.app.get('razorpay');
    const cart = getUserCart(db, req.session.username);
    const cartItems = getCartItems(db, cart);
    const cfg: Config = req.app.get('config file');

    const options: Record<string, any> = {
        conflictingItems: getConflictingItems(db, cart),
        config: cfg,
    }

    if (options.conflictingItems.length === 0) {
        setCartStatus(db, cart, PAYMENT_STATUSES.Pending);
        const subTotal = getSubtotal(cartItems);
        const orderId = createOrder(db, cart, subTotal, req.session.username);

        const razorPayOrderResponse = await razorpay.orders.create({
            amount: subTotal * 100 /* rupees to paise */,
            currency: 'INR',
            receipt: orderId
        });

        const razorpayId = razorPayOrderResponse.id;
        Object.assign(options, {
            subTotal: subTotal * 100, razorpayId, orderId
        });

        setRazorpayOrderId(db, orderId, razorpayId);
    }
    else {
        options.conflictingItems.forEach((item: CartItem) => {
            removeCartItem(db, req.session.username, item.uuid);
        })
    }

    res.render('checkout', options);
}