"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("./base");
const sale_1 = require("../../../database/services/sale");
const convert_1 = require("../../../shared/convert");
var FieldKeys;
(function (FieldKeys) {
    FieldKeys["Date"] = "date";
    FieldKeys["Quantitiy"] = "quantity";
    FieldKeys["Value"] = "value";
})(FieldKeys || (FieldKeys = {}));
const fields = {
    date: {
        label: "Data"
    },
    quantity: {
        label: "Quantidade",
    },
    value: {
        label: "Valor",
        input: {
            currency: true
        }
    }
};
class ViewManagementSales extends base_1.default {
    itemQuery = { $or: [{}] };
    trackingItem = {};
    constructor() {
        super("sales", fields, "./css/management/sales.css");
        this.elements.search.input.element.placeholder = `${global.user.settings.currency}12,42; Código de Barras; Nome do Produto...`;
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
    editItem() {
        if (this.trackingItem === null)
            return;
        this.menus.edit.open();
    }
}
exports.default = ViewManagementSales;
