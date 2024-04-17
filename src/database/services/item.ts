import Item, {IItem, IItemChanges, IPrice, ItemQuery} from "../models/item";
import {collections} from "../index";

export function handleItemQuery(query: IItem): ItemQuery {
    let itemQuery: ItemQuery = {};
    Object.assign(itemQuery, query);

    if(itemQuery.name) itemQuery.name = new RegExp(itemQuery.name, "i");
    return itemQuery;
}

export async function getItem(query: IItem) {
    const itemQuery = handleItemQuery(query);
    return (await collections.items.findOne(itemQuery)) as Item;
}

export async function getItems(query: IItem, limit?: number, offset?: number) {
    const itemQuery = handleItemQuery(query);
    const items = collections.items.find(itemQuery);
    let res: Item[];
    if(limit) {
        if(offset) res = await items.skip(offset).limit(limit).toArray() as Item[];
        else res = await items.limit(limit).toArray() as Item[];
    } else res = await items.toArray() as Item[];
    return res;
}

export async function createItem(item: IItem) {
    if(await getItem(item) !== null) return console.log("Already exists, update it!");

    await collections.items.insertOne(item);
}

export async function updateItem(query: IItem, changes: IItemChanges) {
    const itemQuery = handleItemQuery(query);
    let ok = 0;

    const item = await getItem(query);
    delete changes._id;
    if(item.name == changes.name) delete changes.name;
    if(item.barcode == changes.barcode) delete changes.barcode;
    if(item.price.cost == changes["price.cost"]) delete changes["price.cost"];
    if(item.price.sale == changes["price.sale"]) delete changes["price.sale"];
    if(item.stock == changes.stock) delete changes.stock;
    if(item.ncm == changes.ncm) delete changes.ncm;

    if(Object.keys(changes).length > 0) {
        await collections.items.updateOne(itemQuery, {$set: changes}).then(result => ok = result.modifiedCount);
    } else ok = 1;
    return ok;
}

export async function deleteItem(query: IItem) {
    await collections.items.deleteOne(query);
    return true;
}

export async function deleteItems(query: IItem, except?: IItem | IItem[]) {
    if(except) {
        if(Array.isArray(except)) except = [except];
        query = {
            $and: [
                query,
                {
                    $nor: except
                }
            ]
        }
    }
    await collections.items.deleteMany(query);
    return true;
}