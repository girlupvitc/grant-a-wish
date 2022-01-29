import { Database } from "better-sqlite3";
import { NextFunction, Request, Response } from "express";
import { CartItem } from "../../utils";



const getOrderList = (db: Database, status: number | null) => {
    const query = status ?
        db.prepare('select uuid, amount, user, items, status from orders where status = ?').bind(status)
        : db.prepare('select uuid, amount, user, items, status from orders');
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

const mapFlashes = (flash: Record<string, any>, flashes: string[]) => {
    const res: Record<string, boolean> = {};
    for (const key of flashes) {
        if (flash && flash[key]) {
            res[key] = true;
        }
    }

    return res;
}

const clearFlashes = (flash: Record<string, any>, flashes: string[]) => {
    const res: Record<string, boolean> = {};
    for (const key of flashes) {
        if (flash && flash[key]) {
            delete flash[key];
        }
    }

    return res;
}

export default function admin(req: Request, res: Response, next: NextFunction) {
    req.session.lastPage = 'admin';
    const db: Database = req.app.get('db');

    res.render('admin', {
        user: {
            name: req.session.name,
        },
        ...mapFlashes(req.session.flash, ['wishCreated', 'wishDeleted', 'orderDeleted']),
        orders: getOrderList(db, statusToNumber(req.query.status as string) || null)
    });

    clearFlashes(req.session.flash, ['wishCreated', 'wishDeleted', 'orderDeleted'])
}