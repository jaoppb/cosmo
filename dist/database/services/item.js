"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteItem = exports.updateItem = exports.createItem = exports.getItems = exports.getItem = exports.handleItemQuery = void 0;
const index_1 = require("../index");
function handleItemQuery(query) {
    let itemQuery = {};
    Object.assign(itemQuery, query);
    if (itemQuery.name)
        itemQuery.name = new RegExp(itemQuery.name, "i");
    return itemQuery;
}
exports.handleItemQuery = handleItemQuery;
async function getItem(query) {
    const itemQuery = handleItemQuery(query);
    return (await index_1.collections.items.findOne(itemQuery));
}
exports.getItem = getItem;
async function getItems(query, limit, offset) {
    const itemQuery = handleItemQuery(query);
    const items = index_1.collections.items.find(itemQuery);
    let res;
    if (limit) {
        if (offset)
            res = await items.skip(offset).limit(limit).toArray();
        else
            res = await items.limit(limit).toArray();
    }
    else
        res = await items.toArray();
    return res;
}
exports.getItems = getItems;
async function createItem(item) {
    if (await getItem(item) !== null)
        return console.log("Already exists, update it!");
    await index_1.collections.items.insertOne(item);
}
exports.createItem = createItem;
async function updateItem(query, changes) {
    const itemQuery = handleItemQuery(query);
    let ok = 0;
    const item = await getItem(query);
    delete changes._id;
    if (item.name == changes.name)
        delete changes.name;
    if (item.barcode == changes.barcode)
        delete changes.barcode;
    if (item.price.cost == changes["price.cost"])
        delete changes["price.cost"];
    if (item.price.sale == changes["price.sale"])
        delete changes["price.sale"];
    if (item.stock == changes.stock)
        delete changes.stock;
    if (item.ncm == changes.ncm)
        delete changes.ncm;
    if (Object.keys(changes).length > 0) {
        await index_1.collections.items.updateOne(itemQuery, { $set: changes }).then(result => ok = result.modifiedCount);
    }
    else
        ok = 1;
    return ok;
}
exports.updateItem = updateItem;
async function deleteItem(query) {
    await index_1.collections.items.deleteOne(query);
    return true;
}
exports.deleteItem = deleteItem;
