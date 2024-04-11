import * as mongodb from "mongodb";
import * as dotenv from "dotenv";
import Item, {IItem, NCM} from "./models/item";
import {ISale} from "./models/sale";
import {createItem, getItem, getItems} from "./services/item";
import {IUser} from "./models/user";

export const collections: {
    items?: mongodb.Collection,
    sales?: mongodb.Collection,
    users?: mongodb.Collection,
} = {}

export const itemsUtils: Record<string, Item> = {};

const createPlaceHolderItem = async () => {
    const placeholderItem = {
        name: "Nenhum",
        barcode: "1234567890123",
        price: {
            cost: 0,
            sale: 0
        },
        stock: 0,
        ncm: NCM(["0000", "00", "00"])
    };
    const item = itemsUtils["placeholder"] = await getItem(placeholderItem);

    if(item !== null) return;

    await createItem(placeholderItem);
}

export type CollectionTypes = IItem | ISale;

export default async function connectToDatabase() {
    const client: mongodb.MongoClient = new mongodb.MongoClient(process.env.DB_CONN_STRING);
    await client.connect();
    console.log("Connected to database");
    const db: mongodb.Db = client.db(process.env.DB_NAME);

    collections.items = db.collection<IItem>(process.env.ITEMS_COLLECTION_NAME);
    collections.sales = db.collection<ISale>(process.env.SALES_COLLECTION_NAME);

    collections.users = db.collection<IUser>(process.env.USERS_COLLECTION_NAME);
    await collections.users.createIndex({name: 1});

    await createPlaceHolderItem();

    return true;
}