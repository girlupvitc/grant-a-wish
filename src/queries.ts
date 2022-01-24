import { Database } from "better-sqlite3"
import { isNumber } from "liquidjs/dist/util/underscore";
import { CartItem } from "./utils";
import { v4 } from 'uuid';

export const initDb = (db: Database) => {
    db.prepare(`create table if not exists users(
        username text unique primary key,
        name text,
        cart text not null,
        granted_wishes text default "[]"
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
        status integer not null,
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

export const createWish = (db: Database, details: {
    title: string,
    price: number
    desc?: string
}) => {
    const id = v4();
    db.prepare('insert into wishes(uuid, title, price, status, description) values(?, ?, ?, 0, ?)')
        .run(id, details.title, details.price, details.desc || '');
}

export const getWishes = (db: Database, filters?: {
    min?: number,
    max?: number
}): CartItem[] => {
    const min = filters?.min || 0;
    const max = filters?.max || 2 ** 53;

    const result = db.prepare(
        `select uuid, title, price, description
        from wishes 
        where price between ? and ? 
        and status = 0
    `).all(min, max);

    return result;
}

export const getUserCart = (db: Database, username: string): CartItem[] => {
    const res = db.prepare('select cart from users where username = ?').get(username);
    return JSON.parse(res.cart);
}

export const getUserInfo = (db: Database, username: string | undefined) => {
    if (!username) return null;
    const cart = getUserCart(db, username);

    return {
        cart: cart,
        name: username
    }
}