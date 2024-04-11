"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSales = exports.createSale = void 0;
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
    queries.$or.forEach(query => {
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
    return handledQuery;
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
async function getSales(query, limit, offset) {
    let handledQuery;
    if (query.$or.some(query => Object.keys(query).includes("items")))
        handledQuery = handleQuery(query);
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
