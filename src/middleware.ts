import { NextFunction, Request, Response } from "express";

export const ensureAdmin = (req: Request, res: Response, next: NextFunction) => {

}

export const ensureLoggedIn = (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.email || !req.session.username) res.redirect('/');
    else next();
}