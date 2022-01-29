import { Database } from "better-sqlite3";
import { NextFunction, Request, Response } from "express";
import { getCartItems, getUserCart, getUserInfo } from "../../queries";
import { CartItem, getSubtotal, clearFlashes, mapFlashes } from "../../utils";

export default function cart(req: Request, res: Response, next: NextFunction) {
    const db: Database = req.app.get('db');
    const cart = getUserCart(db, req.session.username);
    if (!cart) return next({ code: 500 });
    const cartItems: CartItem[] = getCartItems(db, cart);

    req.session.lastPage = 'cart';

    res.render('cart', {
        user: getUserInfo(db, req.session.username),
        cartItems,
        subTotal: getSubtotal(cartItems),
        ...mapFlashes(req.session.flash, ['orderDeleted'])
    })

    clearFlashes(req.session.flash, ['orderDeleted']);
}