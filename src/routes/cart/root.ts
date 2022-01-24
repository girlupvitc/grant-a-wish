import { Database } from "better-sqlite3";
import { NextFunction, Request, Response } from "express";
import { getUserCart, getUserInfo } from "../../queries";
import { CartItem } from "../../utils";

export default function cart(req: Request, res: Response, next: NextFunction) {
    const db: Database = req.app.get('db');
    const cart = getUserCart(db, req.session.username);
    const cartItems: CartItem[] = [];

    req.session.lastPage = 'cart';

    if (cart.length !== 0) {
        const query = "SELECT uuid, title, price, description, price FROM wishes WHERE uuid IN (?" + ", ?".repeat(cart.length - 1) + ")";
        const res = db.prepare(query).all(...cart);
        cartItems.push(...res);
    }

    res.render('cart', {
        user: {
            name: req.session.name
        }, cartItems
    })
}