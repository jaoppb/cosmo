"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.itemsUtils = exports.collections = void 0;
const mongodb = require("mongodb");
const item_1 = require("./models/item");
const item_2 = require("./services/item");
exports.collections = {};
exports.itemsUtils = {};
const createPlaceHolderItem = async () => {
    const placeholderItem = {
        name: "Nenhum",
        barcode: "1234567890123",
        price: {
            cost: 0,
            sale: 0
        },
        stock: 0,
        ncm: (0, item_1.NCM)(["0000", "00", "00"])
    };
    const item = exports.itemsUtils["placeholder"] = await (0, item_2.getItem)(placeholderItem);
    if (item !== null)
        return;
    await (0, item_2.createItem)(placeholderItem);
};
async function connectToDatabase() {
    const client = new mongodb.MongoClient(process.env.DB_CONN_STRING);
    await client.connect();
    console.log("Connected to database");
    const db = client.db(process.env.DB_NAME);
    exports.collections.items = db.collection(process.env.ITEMS_COLLECTION_NAME);
    await exports.collections.items.createIndex({ barcode: 1 });
    exports.collections.sales = db.collection(process.env.SALES_COLLECTION_NAME);
    exports.collections.users = db.collection(process.env.USERS_COLLECTION_NAME);
    await exports.collections.users.createIndex({ name: 1 });
    await createPlaceHolderItem();
    return true;
}
exports.default = connectToDatabase;
