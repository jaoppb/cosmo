"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemData = exports.NCM = void 0;
function NCM(value) {
    if (typeof value == "string") {
        if (value.length == 0)
            return undefined;
        if (value.length !== 8)
            throw new Error("String length must be 8");
        value = [value.substring(0, 4), value.substring(4, 6), value.substring(6, 8)];
    }
    if (value[0].length !== 4)
        throw new Error("Length 0 must be 4");
    if (value[1].length !== 2)
        throw new Error("Length 1 must be 2");
    if (value[2].length !== 2)
        throw new Error("Length 2 must be 2");
    return value;
}
exports.NCM = NCM;
class Item {
    _id;
    name;
    barcode;
    price = {
        cost: 0,
        sale: 0
    };
    stock = 0;
    ncm;
    constructor(name, barcode, price, stock, ncm, id) {
        this.name = name;
        this.barcode = barcode;
        if (price)
            this.price = price;
        if (stock)
            this.stock = stock;
        if (ncm)
            this.ncm = ncm;
        if (id)
            this._id = id;
    }
}
exports.default = Item;
class ItemData extends Item {
    quantity;
    holder;
    constructor(item, quantity) {
        super(item.name, item.barcode, item.price, item.stock, item.ncm, item._id);
        this.quantity = quantity;
    }
    setHTMLElement(element) {
        if (!this.holder)
            this.holder = element;
    }
}
exports.ItemData = ItemData;
