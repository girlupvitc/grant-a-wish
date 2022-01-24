import { Database } from "better-sqlite3";
import { NextFunction, Request, Response } from "express";
import { getUserCart, setUserCart } from "../../queries";

export default function removeFromCart(req: Request, res: Response, next: NextFunction) {
    const db: Database = req.app.get('db');
    const cart = getUserCart(db, req.session.username);

    const id = req.params.uuid;
    if (!id) return next(400);

    if (cart.includes(id)) {
        cart.splice(cart.indexOf(id), 1);
        setUserCart(db, req.session.username, cart);
    }
    else {
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