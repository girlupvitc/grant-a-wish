import { NextFunction, Request, Response } from "express";

export default function admin(req: Request, res: Response, next: NextFunction) {
    req.session.lastPage = 'admin';
    res.render('admin', {
        user: {
            name: req.session.name,
        },
        wishCreated: req.session.flash?.wishCreated
    });

    if (req.session.flash?.wishCreated) delete req.session.flash.wishCreated;
}