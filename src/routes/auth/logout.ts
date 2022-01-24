import { NextFunction, Request, Response } from "express";

export default function logout(req: Request, res: Response, next: NextFunction) {
    req.session.username = null;
    req.session.name = null;

    res.redirect('/');
    next();
}