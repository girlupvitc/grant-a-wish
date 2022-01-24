import { Database } from "better-sqlite3";
import { NextFunction, Request, Response } from "express";

export default function admin(req: Request, res: Response, next: NextFunction) {
    console.log('here');
    const db: Database = req.app.get('db');
    console.log('headers sent?', res.headersSent ? 'yes' : 'no');
    res.render('admin', {
        user: {
            name: req.session.name
        }
    });
}