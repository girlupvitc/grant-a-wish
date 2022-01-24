import { NextFunction, Request, Response } from "express";
import { Config } from "./utils";
import { getReasonPhrase, StatusCodes } from 'http-status-codes';

export const ensureAdmin = (req: Request, res: Response, next: NextFunction) => {
    const config: Config = req.app.get('config file');
    if (!config.ADMINS.includes(req.session.email)) {
        next(StatusCodes.FORBIDDEN);
    }
    else {
        next();
    }
}

export const ensureLoggedIn = (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.email || !req.session.username) res.redirect('/');
    else next();
}

export const notFound = (_: Request, res: Response, next: NextFunction) => {
    next(StatusCodes.NOT_FOUND);
}

export const errorHandler = async (err: any, _req: Request, res: Response, _next: NextFunction) => {
    const code = parseInt(err) || StatusCodes.INTERNAL_SERVER_ERROR;

    res.status(code).render('error', {
        code,
        message: getReasonPhrase(code) || "Internal Server Error",
        info: err
    })
}
