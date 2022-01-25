import { Database } from "better-sqlite3";
import { NextFunction, Request, Response } from "express";
import { getCartItems, getUserCart } from "../../queries";
import { CartItem, getSubtotal } from "../../utils";

export default function cart(req: Request, res: Response, next: NextFunction) {
    const db: Database = req.app.get('db');
    const cart = getUserCart(db, req.session.username);
    if (!cart) return next(500);
    const cartItems: CartItem[] = getCartItems(db, cart);

    req.session.lastPage = 'cart';

    res.render('cart', {
        user: {
            name: req.session.name
        },
        cartItems,
        subTotal: getSubtotal(cartItems)
    })
}