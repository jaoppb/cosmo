"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../../../database");
const item_1 = require("../../../database/models/item");
const convert_1 = require("../../../shared/convert");
const item_2 = require("../../../database/services/item");
const base_1 = require("./base");
var FieldKeys;
(function (FieldKeys) {
    FieldKeys["Name"] = "name";
    FieldKeys["Barcode"] = "barcode";
    FieldKeys["Cost"] = "cost";
    FieldKeys["Sale"] = "sale";
    FieldKeys["Stock"] = "stock";
    FieldKeys["NCM"] = "ncm";
})(FieldKeys || (FieldKeys = {}));
const fields = {
    name: {
        label: "Nome"
    },
    barcode: {
        label: "Código"
    },
    cost: {
        label: "Custo",
        input: {
            currency: true
        }
    },
    sale: {
        label: "Venda",
        input: {
            currency: true
        }
    },
    stock: {
        label: "Estoque",
        input: {
            type: "number"
        }
    },
    ncm: {
        label: "NCM"
    }
};
class ViewManagementProducts extends base_1.default {
    itemQuery = {};
    trackingItem = {};
    constructor() {
        super("products", fields, "./css/management/products.css");
        const placeholderItem = database_1.itemsUtils["placeholder"];
        this.createKeyboardAction(/^[^0-9,]$/, (event) => {
            const active = document.activeElement;
            if (event.ctrlKey || event.altKey)
                return;
            if (active instanceof HTMLInputElement &&
                [this.fields.cost.elements.edit.input.element, this.fields.sale.elements.edit.input.element].includes(active)) {
                event.preventDefault();
            }
        });
        this.createKeyboardAction(/^,$/, (event) => {
            const active = document.activeElement;
            if (active instanceof HTMLInputElement &&
                [this.fields.cost.elements.edit.input.element, this.fields.sale.elements.edit.input.element].includes(active)) {
                if (!/^\d+$/.test(active.value))
                    event.preventDefault();
            }
        });
        this.elements.inputs = {
            name: this.fields.name.elements.edit.input,
            barcode: this.fields.barcode.elements.edit.input,
            cost: this.fields.cost.elements.edit.input,
            sale: this.fields.sale.elements.edit.input,
            stock: this.fields.stock.elements.edit.input,
            ncm: this.fields.ncm.elements.edit.input
        };
    }
    deleteItem(itemQuery) {
        (itemQuery ? item_2.deleteItems : item_2.deleteItem)(itemQuery ?? this.trackingItem).then(ok => {
            if (ok)
                this.reset();
        });
    }
    saveItem() {
        try {
            const updatedItem = {
                name: this.elements.inputs.name.element.value,
                barcode: this.elements.inputs.barcode.element.value,
                "price.cost": (0, convert_1.cashToInt)(this.elements.inputs.cost.element.value.replace(/[^,.0-9]/g, "")),
                "price.sale": (0, convert_1.cashToInt)(this.elements.inputs.sale.element.value.replace(/[^,.0-9]/g, "")),
                stock: parseInt(this.elements.inputs.stock.element.value),
                ncm: (0, item_1.NCM)(this.elements.inputs.ncm.element.value)
            };
            (0, item_2.updateItem)(this.trackingItem, updatedItem).then(ok => {
                if (ok) {
                    this.menus.edit.close();
                }
            });
        }
        catch (err) {
            console.log(err);
        }
    }
    loadItems() {
        (0, item_2.getItems)(this.itemQuery, this.batchSize, this.offset).then(items => {
            items.forEach(item => this.renderItem(item));
        });
        this.offset += this.batchSize;
    }
    renderItem(itemData) {
        const item = this.elements.search.items.list.createChild("item", "div");
        const selection = item.createChild("select", "div");
        const input = selection.createChild("input", "input");
        input.element.type = "checkbox";
        input.element.checked = this.elements.search.items.header.checkbox.element.checked;
        const name = item.createChild("name", "span");
        name.element.innerText = itemData.name;
        const barcode = item.createChild("barcode", "span");
        barcode.element.innerText = itemData.barcode;
        const cost = item.createChild("cost", "span");
        const costCurrency = cost.createChild("currency", "span");
        costCurrency.element.innerText = global.user.settings.currency;
        const costNumber = cost.createChild("number", "span");
        costNumber.element.innerText = (0, convert_1.parseToCash)(itemData.price.cost);
        const sale = item.createChild("sale", "span");
        const saleCurrency = sale.createChild("currency", "span");
        saleCurrency.element.innerText = global.user.settings.currency;
        const saleNumber = sale.createChild("number", "span");
        saleNumber.element.innerText = (0, convert_1.parseToCash)(itemData.price.sale);
        const stock = item.createChild("stock", "span");
        stock.element.innerText = itemData.stock.toString();
        const ncm = item.createChild("ncm", "span");
        if (itemData.ncm)
            ncm.element.innerText = (0, convert_1.parseNCM)(itemData.ncm);
        item.element.addEventListener("click", (event) => {
            this.selectItem(item, input, itemData, event);
        });
    }
    queryFromInput() {
        const queryString = this.elements.search.input.element.value;
        this.clearItems();
        this.offset = 0;
        if (queryString === "") {
            this.itemQuery = {};
        }
        else if (queryString) {
            const query = {};
            if (/^\d+$/.test(queryString))
                query.barcode = queryString;
            else
                query.name = queryString;
            this.itemQuery = query;
        }
        this.loadItems();
    }
    editItem() {
        if (this.trackingItem == null)
            return;
        this.elements.inputs.name.element.value = this.trackingItem.name;
        this.elements.inputs.barcode.element.value = this.trackingItem.barcode;
        this.elements.inputs.cost.element.value = (0, convert_1.parseToCash)(this.trackingItem.price.cost);
        this.elements.inputs.sale.element.value = (0, convert_1.parseToCash)(this.trackingItem.price.sale);
        this.elements.inputs.stock.element.value = this.trackingItem.stock.toString();
        if (this.trackingItem.ncm)
            this.elements.inputs.ncm.element.value = (0, convert_1.parseNCM)(this.trackingItem.ncm);
        this.menus.edit.open();
    }
}
exports.default = ViewManagementProducts;
