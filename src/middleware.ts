import { NextFunction, Request, Response } from "express";
import { Config, isAdmin } from "./utils";
import { getReasonPhrase, StatusCodes } from 'http-status-codes';

export const ensureAdmin = (req: Request, res: Response, next: NextFunction) => {
    const config: Config = req.app.get('config file');
    if (!isAdmin(config, req.session.username)) {
        next(StatusCodes.FORBIDDEN);
    }
    else {
        next();
    }
}

export const ensureLoggedIn = (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.username || !req.session.name) res.redirect('/');
    next();
}

export const notFound = (_: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) return;
    next(StatusCodes.NOT_FOUND);
}

export const errorHandler = async (err: any, _req: Request, res: Response, _next: NextFunction) => {
    if (res.headersSent) return;
    const code = parseInt(err) || StatusCodes.INTERNAL_SERVER_ERROR;

    res.status(code).render('error', {
        code,
        message: getReasonPhrase(code) || "Internal Server Error",
        info: `${err}`,
        errStack: err.stack
    })
}
