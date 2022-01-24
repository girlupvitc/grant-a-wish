import { Database } from "better-sqlite3";
import { NextFunction, Request, Response } from "express";
import { getAccessToken, getProfileInfo } from "../../gauth";
import { createUser as createUserIfNotExists } from "../../queries";
import { Config } from "../../utils";

export default async function gauthCallback(req: Request, res: Response, next: NextFunction) {
    const config: Config = req.app.get('config file');
    const authCode = req.query.code as string;
    const token = await getAccessToken(config, authCode);
    const userInfo: any = await getProfileInfo(token);

    req.session.email = userInfo.email;
    req.session.name = userInfo.given_name;

    const db: Database = req.app.get('db');

    createUserIfNotExists(db, {
        name: userInfo.given_name,
        email: userInfo.email
    });

    res.redirect('/');
    next();
};