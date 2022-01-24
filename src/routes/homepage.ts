import { NextFunction, Request, Response } from 'express';
import { getUserInfo, getWishes } from '../queries';

const homepage = (req: Request, res: Response, next: NextFunction) => {
    res.render('index', {
        wishes: getWishes(),
        user: getUserInfo()
    });
}

export default homepage;