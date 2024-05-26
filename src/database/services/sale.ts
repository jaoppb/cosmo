import Sale, {ISale, ISaleChanges, SaleItemQuery, SaleQuery, SaleQueryItem} from "../models/sale";
import {collections} from "../index";
import {getItem, handleItemQuery, updateItem} from "./item";
import {IItem, ItemQuery} from "../models/item";

function handleQuery(queries: SaleQuery): SaleQuery<SaleItemQuery> {
    const handledQuery: SaleQuery<SaleItemQuery> = {
        $or: []
    };
    const handledQueryItems: SaleQueryItem<SaleItemQuery> = {
        items: {
            $elemMatch: {
                $or: []
            }
        }
    };
    handledQuery.$or.push(handledQueryItems);
    queries.$or?.forEach(query => {
        if(!Object.keys(query).includes("items")) return;
        const items = (query as SaleQueryItem).items;
        items.forEach(item => {
            Object.entries(item as ItemQuery).forEach((entry) => {
                const found = handledQueryItems.items.$elemMatch.$or.find(value => Object.keys(value).includes(entry[0])) ?? {};
                if(found[entry[0]] === undefined) {
                    found[entry[0]] = {
                        $in: []
                    };
                    handledQueryItems.items.$elemMatch.$or.push(found);
                }
                found[entry[0]].$in.push(entry[1], entry[1].toLowerCase(), entry[1].toUpperCase());
            })
        })
    });
    return handledQuery.$or.length <= 1 ? handledQuery.$or[0] : handledQuery;
}

export async function createSale(sale: Sale) {
    await collections.sales.insertOne(sale);

    sale.items.forEach(itemData => {
        updateItem({_id: itemData._id}, {
            stock: itemData.stock - itemData.quantity
        });
    });

    return true;
}

export async function getSale(query: SaleQuery) {
    const handledQuery = handleQuery(query);
    if(handledQuery.items.$elemMatch.$or.length === 0) delete handledQuery.items;
    return await collections.sales.findOne(handledQuery) as Sale;
}

export async function getSales(query: SaleQuery, limit?: number, offset?: number) {
    let handledQuery: SaleQuery<SaleItemQuery>;
    if (query.$or.some(query => Object.keys(query).includes("items"))) handledQuery = handleQuery(query);
    if (query.$or.length == 1) {
        query = query.$or[0];
    }

    const sales = collections.sales.find(handledQuery ?? query).sort({timestamp: -1});
    let res: Sale[];
    if (limit) {
        if (offset) res = await sales.skip(offset).limit(limit).toArray() as Sale[];
        else res = await sales.limit(limit).toArray() as Sale[];
    } else res = await sales.toArray() as Sale[];
    return res;
}

export async function updateSale(query: ISale, changes: ISaleChanges) {
    const sale = await getSale(query);
    let ok = 0;

    delete changes._id;
    if(sale.timestamp === changes.timestamp) delete changes.timestamp;
    if(sale.total.price === changes["total.price"]) delete changes["total.price"];
    if(sale.total.quantity === changes["total.quantity"]) delete changes["total.quantity"];
    if(sale.items.toString() === changes.items.toString()) delete changes.items;

    if(Object.keys(changes).length > 0) {
        ok = (await collections.sales.updateOne(query, {$set: changes})).modifiedCount;
    }
    return ok;
}

export async function deleteSale(query: ISale) {
    for (const itemSold of query.items) {
        const currentItem = await getItem({_id: itemSold._id});
        await updateItem(
            {_id: itemSold._id},
            {
                stock: currentItem.stock + itemSold.quantity
            }
        );
    }
    await collections.sales.deleteOne(query);
    return true;
}

export async function deleteSales(query: SaleQuery, except?: ISale | ISale[]) {
    if(except) {
        if(!Array.isArray(except)) except = [except];
        query = {
            $and: [
                query,
                {
                    $nor: except,
                }
            ]
        }
    }
    await collections.sales.deleteMany(query);
    return true;
}