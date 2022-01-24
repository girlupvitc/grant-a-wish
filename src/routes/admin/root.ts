import { Database } from "better-sqlite3";
import { NextFunction, Request, Response } from "express";

export default function admin(req: Request, res: Response, next: NextFunction) {
    res.render('admin', {
        user: {
            name: req.session.name
        }
    });
}