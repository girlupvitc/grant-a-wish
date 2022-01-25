import { Database } from "better-sqlite3";
import { NextFunction, Request, Response } from "express";
import { getUserCart, setUserCart } from "../../queries";

export const removeCartItem = (db: Database, user: string, uuid: string) => {
    const cart = getUserCart(db, user);
    if (!cart) return false;

    if (cart.includes(uuid)) {
        cart.splice(cart.indexOf(uuid), 1);
    }
    else return false;

    setUserCart(db, user, cart);
    return true;
}

export default function removeFromCart(req: Request, res: Response, next: NextFunction) {
    const db: Database = req.app.get('db');
    const cart = getUserCart(db, req.session.username);

    const id = req.params.uuid;
    if (!id) return next(400);

    if (!removeCartItem(db, req.session.username, id)) {
        return next(400);
    }

    if (req.session.lastPage === 'cart') {
        res.redirect('/cart');
    }
    else if (req.session.lastPage?.startsWith('/wishes/')) {
        res.redirect(req.session.lastPage);
    }
    else {
        res.redirect('/');
    }

}