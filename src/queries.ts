import { Database } from "better-sqlite3"
import { isNumber } from "liquidjs/dist/util/underscore";
import { CartItem } from "./utils";

export const initDb = (db: Database) => {
    db.prepare(`create table if not exists users(
        username text unique primary key,
        name text,
        cart text not null
    )`).run();

    db.prepare(`create table if not exists orders(
        uuid unique primary key,
        user text,
        items text not null,
        status text not null,
        payment_method text
    )`).run();

    db.prepare(`create table if not exists wishes(
        uuid unique primary key,
        title text not null,
        price integer not null,
        description text
    )`).run();
}

export const createUser = (db: Database, details: {
    name: string,
    email: string
}) => {
    db.prepare(`insert or ignore into 
        users(username, name, cart)
        values(?, ?, ?)
    `).run(details.email, details.name, '[]');
}

export const getWishes = (filters?: {
    min?: number,
    max?: number
}) => {
    return [{
        title: 'test',
        description: 'testing a description',
        uuid: '1c895980-9b0c-481e-a985-b16a02a3ce0b',
        price: 999
    },
    {
        title: 'second wish',
        description: 'testing another description',
        uuid: '294bf280-f93f-417b-b492-29898183792f',
        price: 499
    }]
}

export const getUserCart = (db: Database, username: string | undefined): CartItem[] | null => {
    if (!username) {
        return null;
    }
    else {
        const res = db.prepare('select cart from users where username = ?').get(username);
        return JSON.parse(res.cart);
    }
}

export const getUserInfo = (db: Database, username: string | undefined) => {
    if (username) {
        const cart = getUserCart(db, username);
        if (!cart) return null;
        return {
            cart: cart,
            name: username
        }
    }
    else {
        return null;
    }
}