import { Database } from "better-sqlite3"
import { isNumber } from "liquidjs/dist/util/underscore";
import { CartItem, PAYMENT_STATUSES } from "./utils";
import { v4 } from 'uuid';
import { Express } from "express";

export const initDb = (db: Database) => {
    db.prepare(`create table if not exists users(
        username text unique primary key,
        uuid text unique not null,
        name text,
        cart text not null,
        checking_out integer default 0
    ) STRICT`).run();

    db.prepare(`create table if not exists orders(
        uuid text unique primary key,
        amount integer not null,
        user text not null,
        items text not null,
        status integer not null,
        razorpay_order_id text
    ) STRICT`).run();

    db.prepare(`create table if not exists wishes(
        uuid text unique primary key,
        title text not null,
        price integer not null,
        status integer not null,
        description text
    ) STRICT`).run();
}

export const createUser = (db: Database, details: {
    name: string,
    email: string
}) => {
    const uuid = v4();
    db.prepare(`insert or ignore into 
        users(username, uuid, name, cart, checking_out)
        values(?, ?, ?, ?, 0)
    `).run(details.email, uuid, details.name, '[]');
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

export const getWish = (db: Database, uuid: string): CartItem | undefined => {
    const wish = db.prepare('select title, description, price, uuid, status from wishes where uuid = ?').get(uuid);
    return wish;
}

export const deleteWish = (db: Database, uuid: string) => {
    db.prepare('delete from wishes where uuid = ?').run(uuid);
}

export const getWishes = (db: Database, filters?: {
    min?: number,
    max?: number
}): CartItem[] => {
    const min = filters?.min || 0;
    const max = filters?.max || 2 ** 53;

    const result = db.prepare(
        `select uuid, title, price, description, status
        from wishes 
        where price between ? and ? 
        and status = ?
        order by price asc
    `).all(min, max, PAYMENT_STATUSES.Available);

    return result;
}

export const getCartItems = (db: Database, cart: string[]) => {
    const cartItems: CartItem[] = [];

    if (cart.length !== 0) {
        const query = "SELECT uuid, title, price, description, status FROM wishes WHERE uuid IN (?" + ", ?".repeat(cart.length - 1) + ")";
        const res = db.prepare(query).all(...cart);
        cartItems.push(...res);
    }

    return cartItems;
}

export const getUserCart = (db: Database, username: string): string[] | null => {
    const res = db.prepare('select cart from users where username = ?').get(username);
    if (!res) return null;
    return JSON.parse(res.cart);
}

export const setUserCart = (db: Database, username: string, contents: string[]) => {
    db.prepare('update users set cart = ? where username = ?')
        .run(JSON.stringify(contents), username);
}

export const isAvailableWish = (db: Database, uuid: string) => {
    const isAvailable = !!(db.prepare('select uuid from wishes where status = ? and uuid = ?').get(PAYMENT_STATUSES.Available, uuid));
    return isAvailable;
}

export const isValidWish = (db: Database, uuid: string) => {
    const isValid = !!(db.prepare('select uuid from wishes where uuid = ?').get(uuid));
    return isValid;
}

export const setWishStatus = (db: Database, uuid: string, status: 0 | 1 | 2 | 3) => {
    db.prepare('update wishes set status = ? where uuid = ?').run(status, uuid);
}

export const getConflictingItems = (db: Database, cart: string[]): CartItem[] => {
    if (cart.length !== 0) {
        const query = "SELECT title, description, uuid, price, status from wishes where status != ? and uuid IN (?" + ", ?".repeat(cart.length - 1) + ")";
        const res = db.prepare(query).all(PAYMENT_STATUSES.Available, ...cart);
        return res;
    }
    else return [];
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

export const createOrder = (db: Database, cart: string[], subtotal: number, user: string) => {
    const id = v4();
    db.prepare(`insert into orders(uuid, user, items, status, amount) values(?, ?, ?, ?, ?)`)
        .run(id, user, JSON.stringify(cart), PAYMENT_STATUSES.Pending, subtotal);

    return id;
}

export const setRazorpayOrderId = (db: Database, id: string, razorpayId: string) => {
    db.prepare('update orders set razorpay_order_id = ? where uuid = ?').run(razorpayId, id);
}

export function isPendingOrder(db: Database, orderId: string) {
    const order = db.prepare('select uuid from orders where uuid = ? and status = ?').get(orderId, PAYMENT_STATUSES.Pending);
    return !!order;
}

export const getUserInfo = (db: Database, username: string | undefined) => {
    if (!username) return null;
    const cart = getUserCart(db, username);
    const meta = db.prepare('select name, uuid, checking_out from users where username = ?').get(username);

    console.log(meta);

    return { cart, name: meta.name, uuid: meta.uuid, isCheckingOut: meta.checking_out };
}

export const getUsername = (db: Database, uuid: string): string | null => {
    return db.prepare('select username from users where uuid = ?').get(uuid)?.username ?? null;
}

export const getGrantedWishes = (db: Database, username: string) => {
    const granted = db.prepare('select items from orders where user = ? and status = ?').all(username, PAYMENT_STATUSES.Successful);
    const carts = granted.map(row => row.items).map(item => {
        return JSON.parse(item);
    })
    return getCartItems(db, carts.flat());
}

export const getOrderDetails = (db: Database, orderId: string) => {
    const result = db.prepare('select amount, uuid, items, status, user, razorpay_order_id from orders where uuid = ?').get(orderId);

    if (!result) return null;

    result.razorpayId = result.razorpay_order_id;
    result.items = JSON.parse(result.items);
    delete result.razorpay_order_id;

    return result;
}

export const cancelOrder = (db: Database, orderId: string, items: string[]) => {
    setCartStatus(db, items, PAYMENT_STATUSES.Available);
    deleteOrder(db, orderId);
}

export const getWishCount = (db: Database) => {
    const result = db.prepare('select count(status) as count from wishes where status = ?').get(PAYMENT_STATUSES.Successful);
    return result.count;
}

export const startUserCheckout = (db: Database, username: string) => {
    db.prepare('update users set checking_out = 1 where username = ?').run(username);
}

export const stopUserCheckout = (db: Database, username: string) => {
    db.prepare('update users set checking_out = 0 where username = ?').run(username);
}

export function getPendingOrder(db: Database, user: string) {
    return db.prepare('select uuid from orders where user = ?').get(user)?.uuid || null;
}