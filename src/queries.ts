import { Database } from "better-sqlite3"
import { isNumber } from "liquidjs/dist/util/underscore";
import { CartItem, PAYMENT_STATUSES } from "./utils";
import { v4 } from 'uuid';
import e from "express";

export const initDb = (db: Database) => {
    db.prepare(`create table if not exists users(
        username text unique primary key,
        name text,
        cart text not null,
        granted_wishes text default "[]"
    )`).run();

    db.prepare(`create table if not exists orders(
        uuid unique primary key,
        user text not null,
        items text not null,
        status text not null,
        razorpay_order_id text
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
        and status = ?
    `).all(min, max, PAYMENT_STATUSES.Available);

    return result;
}

export const getCartItems = (db: Database, cart: string[]) => {
    const cartItems: CartItem[] = [];

    if (cart.length !== 0) {
        const query = "SELECT uuid, title, price, description, price FROM wishes WHERE uuid IN (?" + ", ?".repeat(cart.length - 1) + ")";
        const res = db.prepare(query).all(...cart);
        cartItems.push(...res);
    }

    return cartItems;
}

export const getUserCart = (db: Database, username: string): string[] => {
    const res = db.prepare('select cart from users where username = ?').get(username);
    return JSON.parse(res.cart);
}

export const setUserCart = (db: Database, username: string, contents: string[]) => {
    db.prepare('update users set cart = ? where username = ?')
        .run(JSON.stringify(contents), username);
}

export const isValidWish = (db: Database, uuid: string) => {
    const isValid = !!(db.prepare('select uuid from wishes where status = ? and uuid = ?').get(PAYMENT_STATUSES.Available, uuid));
    return isValid;
}

export const setStatus = (db: Database, uuid: string, status: 0 | 1 | 2 | 3) => {
    db.prepare('update wishes set status = ? where uuid = ?').run(status, uuid);
}

export const isValidCart = (db: Database, cart: string[]) => {
    if (cart.length !== 0) {
        const query = "SELECT uuid from wishes where status != ? and uuid IN (?" + ", ?".repeat(cart.length - 1) + ")";
        const res = db.prepare(query).all(PAYMENT_STATUSES.Available, ...cart);
        return res.length == 0;
    }
    else return false;
}

export const setCartStatus = (db: Database, cart: string[], status: 0 | 1 | 2) => {
    if (cart.length !== 0) {
        const query = "UPDATE wishes SET status = ? WHERE uuid IN (?" + ", ?".repeat(cart.length - 1) + ")";
        db.prepare(query).run(status, ...cart);
    }
}

export const setOrderStatus = (db: Database, uuid: string, status: 0 | 1 | 2) => {
    const query = "UPDATE orders SET status = ? WHERE uuid = ?";
    db.prepare(query).run(status, uuid);
}

export const deleteOrder = (db: Database, uuid: string) => {
    db.prepare('delete from orders where uuid = ?').run(uuid);
}

export const createOrder = (db: Database, cart: string[], user: string) => {
    const id = v4();
    db.prepare(`insert into orders(uuid, user, items, status) values(?, ?, ?, ?)`)
        .run(id, user, JSON.stringify(cart), PAYMENT_STATUSES.Pending);

    return id;
}

export const setRazorpayOrderId = (db: Database, id: string, razorpayId: string) => {
    db.prepare('update orders set razorpay_order_id = ? where uuid = ?').run(razorpayId, id);
}

export const getUserInfo = (db: Database, username: string | undefined) => {
    if (!username) return null;
    const cart = getUserCart(db, username);

    return {
        cart: cart,
        name: username
    }
}