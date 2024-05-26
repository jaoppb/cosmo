"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSales = exports.deleteSale = exports.updateSale = exports.getSales = exports.getSale = exports.createSale = void 0;
const index_1 = require("../index");
const item_1 = require("./item");
function handleQuery(queries) {
    const handledQuery = {
        $or: []
    };
    const handledQueryItems = {
        items: {
            $elemMatch: {
                $or: []
            }
        }
    };
    handledQuery.$or.push(handledQueryItems);
    queries.$or?.forEach(query => {
        if (!Object.keys(query).includes("items"))
            return;
        const items = query.items;
        items.forEach(item => {
            Object.entries(item).forEach((entry) => {
                const found = handledQueryItems.items.$elemMatch.$or.find(value => Object.keys(value).includes(entry[0])) ?? {};
                if (found[entry[0]] === undefined) {
                    found[entry[0]] = {
                        $in: []
                    };
                    handledQueryItems.items.$elemMatch.$or.push(found);
                }
                found[entry[0]].$in.push(entry[1], entry[1].toLowerCase(), entry[1].toUpperCase());
            });
        });
    });
    return handledQuery.$or.length <= 1 ? handledQuery.$or[0] : handledQuery;
}
async function createSale(sale) {
    await index_1.collections.sales.insertOne(sale);
    sale.items.forEach(itemData => {
        (0, item_1.updateItem)({ _id: itemData._id }, {
            stock: itemData.stock - itemData.quantity
        });
    });
    return true;
}
exports.createSale = createSale;
async function getSale(query) {
    const handledQuery = handleQuery(query);
    if (handledQuery.items.$elemMatch.$or.length === 0)
        delete handledQuery.items;
    return await index_1.collections.sales.findOne(handledQuery);
}
exports.getSale = getSale;
async function getSales(query, limit, offset) {
    let handledQuery;
    if (query.$or.some(query => Object.keys(query).includes("items")))
        handledQuery = handleQuery(query);
    if (query.$or.length == 1) {
        query = query.$or[0];
    }
    const sales = index_1.collections.sales.find(handledQuery ?? query).sort({ timestamp: -1 });
    let res;
    if (limit) {
        if (offset)
            res = await sales.skip(offset).limit(limit).toArray();
        else
            res = await sales.limit(limit).toArray();
    }
    else
        res = await sales.toArray();
    return res;
}
exports.getSales = getSales;
async function updateSale(query, changes) {
    const sale = await getSale(query);
    let ok = 0;
    delete changes._id;
    if (sale.timestamp === changes.timestamp)
        delete changes.timestamp;
    if (sale.total.price === changes["total.price"])
        delete changes["total.price"];
    if (sale.total.quantity === changes["total.quantity"])
        delete changes["total.quantity"];
    if (sale.items.toString() === changes.items.toString())
        delete changes.items;
    if (Object.keys(changes).length > 0) {
        ok = (await index_1.collections.sales.updateOne(query, { $set: changes })).modifiedCount;
    }
    return ok;
}
exports.updateSale = updateSale;
async function deleteSale(query) {
    for (const itemSold of query.items) {
        const currentItem = await (0, item_1.getItem)({ _id: itemSold._id });
        await (0, item_1.updateItem)({ _id: itemSold._id }, {
            stock: currentItem.stock + itemSold.quantity
        });
    }
    await index_1.collections.sales.deleteOne(query);
    return true;
}
exports.deleteSale = deleteSale;
async function deleteSales(query, except) {
    if (except) {
        if (!Array.isArray(except))
            except = [except];
        query = {
            $and: [
                query,
                {
                    $nor: except,
                }
            ]
        };
    }
    await index_1.collections.sales.deleteMany(query);
    return true;
}
exports.deleteSales = deleteSales;
