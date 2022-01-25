import { Database } from "better-sqlite3";
import { NextFunction, Request, Response } from "express";
import { CartItem } from "../../utils";



const getOrderList = (db: Database, status: number | null) => {
    const query = status ?
        db.prepare('select uuid, amount, user, items, status from orders where status = ?').bind(status)
        : db.prepare('select uuid, amount, user, items, status from orders');
    console.log(query);
    return query.all().map((item) => {
        item.items = JSON.parse(item.items);
        item.status = item.status === 1 ? 'Pending' : 'Complete'
        return item;
    })
}

const statusToNumber = (status: string) => {
    switch (status) {
        case 'pending': return 1;
        case 'complete': return 2;
        default: return null;
    }
}

export default function admin(req: Request, res: Response, next: NextFunction) {
    req.session.lastPage = 'admin';
    const db: Database = req.app.get('db');

    res.render('admin', {
        user: {
            name: req.session.name,
        },
        wishCreated: req.session.flash?.wishCreated,
        orders: getOrderList(db, statusToNumber(req.query.status as string) || null)
    });

    if (req.session.flash?.wishCreated) delete req.session.flash.wishCreated;
}