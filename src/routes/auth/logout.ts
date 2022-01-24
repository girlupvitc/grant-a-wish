import { NextFunction, Request, Response } from "express";

export default function logout(req: Request, res: Response, next: NextFunction) {
    req.session.email = null;
    req.session.name = null;

    res.redirect('/');
    next();
}