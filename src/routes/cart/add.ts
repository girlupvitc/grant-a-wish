import { Database } from "better-sqlite3";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { getUserCart, getUserInfo, isAvailableWish, setUserCart } from "../../queries";

export default function addToCart(req: Request, res: Response, next: NextFunction) {
    const db: Database = req.app.get('db');
    const cart = getUserCart(db, req.session.username);

    const user = getUserInfo(db, req.session.username);
    if (!user) return next({ code: 500 });
    if (user?.isCheckingOut) {
        return next({ code: 403, msg: "Checkout in progress." });
    }

    const id = req.params.uuid;
    if (!id) return next({
        code: StatusCodes.BAD_REQUEST,
        msg: 'Invalid ID supplied.'
    });
    if (!cart) return next({
        code: StatusCodes.INTERNAL_SERVER_ERROR,
        msg: 'Getting cart failed.'
    });

    if (isAvailableWish(db, id)) {
        cart.push(id);
        setUserCart(db, req.session.username, cart);
    }
    else {
        return next({
            code: StatusCodes.BAD_REQUEST,
            msg: 'That wish has already been granted.'
        });
    }
    if (req.session.lastPage?.startsWith('/wishes/')) {
        res.redirect(req.session.lastPage);
    }
    else {
        res.redirect('/');
    }
}