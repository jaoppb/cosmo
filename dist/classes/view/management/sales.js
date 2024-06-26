"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("./base");
const sale_1 = require("../../../database/services/sale");
const convert_1 = require("../../../shared/convert");
var FieldKeys;
(function (FieldKeys) {
    FieldKeys["Date"] = "date";
    FieldKeys["Quantity"] = "quantity";
    FieldKeys["Value"] = "value";
})(FieldKeys || (FieldKeys = {}));
const fields = {
    date: {
        label: "Data",
        input: {
            type: "datetime-local"
        }
    },
    quantity: {
        label: "Quantidade",
        input: {
            readonly: true,
        }
    },
    value: {
        label: "Valor Pago",
        input: {
            currency: true,
            readonly: true,
        }
    }
};
class ViewManagementSales extends base_1.default {
    itemQuery = { $or: [{}] };
    editFields;
    trackingItem = {};
    constructor() {
        super("sales", fields, "./css/management/sales.css");
        this.elements.search.input.element.placeholder = `${global.user.settings.currency}12,42; Código de Barras; Nome do Produto...`;
        this.editFields = {
            date: this.fields.date.elements.edit.input,
            value: this.fields.value.elements.edit.input,
            quantity: this.fields.quantity.elements.edit.input,
        };
        this.dbFunctions = {
            getOne: sale_1.getSale,
            getAll: sale_1.getSales,
            create: sale_1.createSale,
            deleteOne: sale_1.deleteSale,
            deleteAll: sale_1.deleteSales,
            update: sale_1.updateSale,
        };
    }
    renderItem(itemData) {
        const item = this.elements.search.items.list.createChild("item", "div");
        const selection = item.createChild("select", "div");
        const input = selection.createChild("input", "input");
        input.element.type = "checkbox";
        const date = item.createChild("date", "span");
        date.element.innerText = new Date(itemData.timestamp).toLocaleString("pt-br");
        const quantity = item.createChild("quantity", "span");
        quantity.element.innerText = itemData.total.quantity.toString();
        const price = item.createChild("price", "span");
        const priceCurrency = price.createChild("currency", "span");
        priceCurrency.element.innerText = global.user.settings.currency;
        const priceNumber = price.createChild("number", "span");
        priceNumber.element.innerText = (0, convert_1.parseToCash)(itemData.total.price);
        item.element.addEventListener("click", (event) => {
            this.selectItem(item, input, itemData, event);
        });
    }
    queryFromInput() {
        let queryString = this.elements.search.input.element.value
            .trim()
            .split(/;\s*/);
        this.clearItems();
        this.offset = 0;
        if (queryString.length == 1 && queryString[0].length == 0) {
            this.itemQuery.$or = [{}];
        }
        else {
            this.itemQuery.$or = [];
            for (const eachQuery of queryString) {
                const query = {};
                if (new RegExp(`^${global.user.settings.currency.replace("$", "\\$")}`).test(eachQuery)) {
                    query["total.price"] = (0, convert_1.cashToInt)(eachQuery.substring(2));
                }
                else if (/\d+,?\d*/.test(eachQuery)) {
                    query["total.price"] = (0, convert_1.cashToInt)(eachQuery);
                    query["items"] = [{ barcode: eachQuery }];
                }
                else {
                    query["items"] = [{ name: eachQuery }];
                }
                this.itemQuery.$or.push(query);
            }
        }
        this.loadItems();
    }
    saveItem() {
        const updated = {};
        const timestamp = Date.parse(this.editFields.date.element.value);
        if (timestamp !== this.trackingItem.timestamp)
            updated.timestamp = timestamp;
        super.saveItem(updated);
    }
    editItem() {
        if (this.trackingItem === null)
            return;
        const date = new Date(this.trackingItem.timestamp);
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        this.editFields.date.element.value = date.toISOString().replace(/Z$/, "");
        this.editFields.value.element.value = (0, convert_1.parseToCash)(this.trackingItem.total.price);
        this.editFields.quantity.element.value = this.trackingItem.total.quantity.toString();
        this.menus.edit.open();
    }
}
exports.default = ViewManagementSales;
