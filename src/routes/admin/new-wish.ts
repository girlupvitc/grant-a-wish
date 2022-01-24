import { Database } from "better-sqlite3";
import { NextFunction, Request, Response } from "express";
import { createWish } from "../../queries";

export default function newWish(req: Request, res: Response, next: NextFunction) {
    const db: Database = req.app.get('db');

    createWish(db, {
        desc: req.body['new-wish-desc'],
        price: req.body['new-wish-price'],
        title: req.body['new-wish-title']
    });

    req.session.flash = {
        wishCreated: true,
        ...req.session.flash
    }

    res.redirect('/admin');
}