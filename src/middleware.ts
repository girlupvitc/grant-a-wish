import { NextFunction, Request, Response } from "express";
import { Config } from "./utils";

export const ensureAdmin = (req: Request, res: Response, next: NextFunction) => {
    const config: Config = req.app.get('config file');
    if (!config.ADMINS.includes(req.session.email)) {
        next(403);
    }
    else {
        next();
    }
}

export const ensureLoggedIn = (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.email || !req.session.username) res.redirect('/');
    else next();
}