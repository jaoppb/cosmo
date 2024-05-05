import {ObjectId} from "mongodb";
import ElementHolder from "../../classes/element/holder";

export interface IPrice {
    cost: number,
    sale: number
}

export type TNCM = [string, string, string];

export function NCM(value: TNCM | string) {
    if(typeof value == "string") {
        if(value.length == 0) return undefined;
        if (value.length !== 8) throw new Error("String length must be 8");
        value = [value.substring(0, 4), value.substring(4, 6), value.substring(6, 8)];
    }
    if (value[0].length !== 4) throw new Error("Length 0 must be 4");
    if (value[1].length !== 2) throw new Error("Length 1 must be 2");
    if (value[2].length !== 2) throw new Error("Length 2 must be 2");
    return value;
}

export interface IItem extends Record<string, any> {
    _id?: ObjectId;
    name?: string;
    barcode?: string;
    price?: IPrice;
    stock?: number ;
    ncm?: TNCM;
}

export type OrItemFilter = {
    [K in keyof ItemQuery]: {
        $in: ItemQuery[K][]
    }
}

export type ItemQuery = Omit<IItem, "name"> & {
    name?: RegExp
}
export interface IItemChanges extends IItem {
    "price.cost"?: number;
    "price.sale"?: number;
}

export default class Item implements IItem {
    _id?: ObjectId;
    name: string;
    barcode: string;
    price: IPrice = {
        cost: 0,
        sale: 0
    };
    stock: number = 0;
    ncm?: TNCM;
    constructor(name: string, barcode: string, price?: IPrice, stock?: number, ncm?: TNCM, id?: ObjectId) {
        this.name = name;
        this.barcode = barcode;
        if(price) this.price = price;
        if(stock) this.stock = stock;
        if(ncm) this.ncm = ncm;
        if(id) this._id = id;
    }
}

export interface IItemData extends IItem {
    quantity: number;
}

export class ItemData extends Item implements IItemData {
    quantity: number;
    holder: ElementHolder;
    constructor(item: Item, quantity: number) {
        super(
            item.name,
            item.barcode,
            item.price,
            item.stock,
            item.ncm,
            item._id
        );
        this.quantity = quantity;
    }

    setHTMLElement(element: ElementHolder) {
        if(!this.holder) this.holder = element;
    }
}