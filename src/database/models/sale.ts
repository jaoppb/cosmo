import {ObjectId} from "mongodb";
import {IItem, IItemData, OrItemFilter, ItemQuery} from "./item";

export interface ISaleTotal {
    quantity?: number,
    price?: number,
}

export enum SaleFields {
    _id = "_id",
    items = "items",
    timestamp = "timestamp",
    total = "total",
}

type SaleKeys = keyof typeof SaleFields;
type SaleKeyFields = {[key in SaleKeys]?: any};

export interface ISale extends SaleKeyFields {
    _id?: ObjectId;
    items?: IItemData[];
    timestamp?: number;
    total?: ISaleTotal;
}

export type SaleItemQuery = {
    $elemMatch: {
        $or: OrItemFilter[]
    }
};

export type SaleQueryItem<Type = (ItemQuery | IItem)[]> = { items?: Type }

export type SaleQuery<Type = (ItemQuery | IItem)[]> = Omit<ISale, "items"> & {
    $or?: (SaleQuery | { "total.quantity"?: number } | { "total.price"?: number } | SaleQueryItem<Type>)[],
    "total.quantity"?: number,
    "total.price"?: number,
    items?: Type
}

export type PaymentInfo = {
    types: {
        [K in (typeof global.user.settings.paymentTypes extends ReadonlyArray<infer U> ? U : never)]: number
    }
    result: {
        quantity: number,
        paid: number,
        price: number,
    }
}

export default class Sale implements ISale {
    _id: ObjectId;
    items: IItemData[];
    timestamp: number;
    total: {
        quantity: number,
        price: number,
    }

    constructor(items: Exclude<IItemData, "holder">[], paymentInfo: PaymentInfo, id?: ObjectId) {
        if (this._id) this._id = id;
        this.items = items;

        this.total = {
            quantity: 0,
            price: 0
        };
        items.forEach(itemData => {
            this.total.quantity += itemData.quantity;
            this.total.price += itemData.quantity * itemData.price.sale;
        })
        this.timestamp = Date.now();
    }
}