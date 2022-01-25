import { Database } from "better-sqlite3";
import { NextFunction, Request, Response } from "express";
import { getUserCart, isAvailableWish, setUserCart } from "../../queries";

export default function addToCart(req: Request, res: Response, next: NextFunction) {
    const db: Database = req.app.get('db');
    const cart = getUserCart(db, req.session.username);

    const id = req.params.uuid;
    if (!id) return next(400);

    if (isAvailableWish(db, id)) {
        cart.push(id);
        setUserCart(db, req.session.username, cart);
    }
    else {
        return next(400);
    }
    if (req.session.lastPage?.startsWith('/wishes/')) {
        res.redirect(req.session.lastPage);
    }
    else {
        res.redirect('/');
    }
}