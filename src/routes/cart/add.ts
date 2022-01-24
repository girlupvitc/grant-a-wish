import { Database } from "better-sqlite3";
import { NextFunction, Request, Response } from "express";
import { getUserCart, isValidWish, setUserCart } from "../../queries";

export default function addToCart(req: Request, res: Response, next: NextFunction) {
    console.log('here');
    const db: Database = req.app.get('db');
    const cart = getUserCart(db, req.session.username);

    const id = req.params.uuid;
    if (!id) return next(400);

    if (isValidWish(db, id)) {
        cart.push(id);
        setUserCart(db, req.session.username, cart);
    }
    else {
        return next(400);
    }

    res.redirect('/');
}