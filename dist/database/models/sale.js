"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SaleFields = void 0;
var SaleFields;
(function (SaleFields) {
    SaleFields["_id"] = "_id";
    SaleFields["items"] = "items";
    SaleFields["timestamp"] = "timestamp";
    SaleFields["total"] = "total";
})(SaleFields || (exports.SaleFields = SaleFields = {}));
class Sale {
    _id;
    items;
    timestamp;
    total;
    constructor(items, paymentInfo, id) {
        if (this._id)
            this._id = id;
        this.items = items;
        this.total = {
            quantity: 0,
            price: 0
        };
        items.forEach(itemData => {
            this.total.quantity += itemData.quantity;
            this.total.price += itemData.quantity * itemData.price.sale;
        });
        this.timestamp = Date.now();
    }
}
exports.default = Sale;
