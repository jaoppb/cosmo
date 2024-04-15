"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../../../database");
const item_1 = require("../../../database/models/item");
const convert_1 = require("../../../shared/convert");
const item_2 = require("../../../database/services/item");
const base_1 = require("./base");
class ViewManagementProducts extends base_1.default {
    itemQuery = {};
    trackingItem = {};
    constructor() {
        super("products", "./css/management/products.css");
        const placeholderItem = database_1.itemsUtils["placeholder"];
        for (const text of ["Name", "Barcode", "Cost", "Sale", "Stock", "NCM"]) {
            this.elements.search.items.header.main.createChild(text.toLowerCase(), "span").element.innerText = text;
        }
        const editName = this.elements.editMenu.fields.createChild("name", "div", ["field"]);
        const editNameLabel = editName.createChild("label", "span");
        editNameLabel.element.innerText = "Name: ";
        const editNameInput = editName.createChild("input", "input");
        const editBarcode = this.elements.editMenu.fields.createChild("barcode", "div", ["field"]);
        const editBarcodeLabel = editBarcode.createChild("label", "span");
        editBarcodeLabel.element.innerText = "Barcode: ";
        const editBarcodeInput = editBarcode.createChild("input", "input");
        const editCost = this.elements.editMenu.fields.createChild("cost", "div", ["field"]);
        const editCostLabel = editCost.createChild("label", "span");
        editCostLabel.element.innerText = "Cost: ";
        const editCostInput = editCost.createChild("input", "div");
        const editCostCurrency = editCostInput.createChild("currency", "span");
        editCostCurrency.element.innerText = global.user.settings.currency;
        const editCostNumber = editCostInput.createChild("number", "input");
        const editSale = this.elements.editMenu.fields.createChild("sale", "div", ["field"]);
        const editSaleLabel = editSale.createChild("label", "span");
        editSaleLabel.element.innerText = "Sale: ";
        const editSaleInput = editSale.createChild("input", "div");
        const editSaleCurrency = editSaleInput.createChild("currency", "span");
        editSaleCurrency.element.innerText = global.user.settings.currency;
        const editSaleNumber = editSaleInput.createChild("number", "input");
        const editStock = this.elements.editMenu.fields.createChild("stock", "div", ["field"]);
        const editStockLabel = editStock.createChild("label", "span");
        editStockLabel.element.innerText = "Stock: ";
        const editStockInput = editStock.createChild("input", "input");
        editStockInput.element.type = "number";
        const editNCM = this.elements.editMenu.fields.createChild("ncm", "div", ["field"]);
        const editNCMLabel = editNCM.createChild("label", "span");
        editNCMLabel.element.innerText = "NCM: ";
        const editNCMInput = editNCM.createChild("input", "input");
        editNCMInput.element.maxLength = 10;
        this.createKeyboardAction(/^[^0-9,]$/, (event) => {
            const active = document.activeElement;
            if (event.ctrlKey || event.altKey)
                return;
            if (active instanceof HTMLInputElement &&
                [editCostNumber.element, editSaleNumber.element].includes(active)) {
                event.preventDefault();
            }
        });
        this.createKeyboardAction(/^,$/, (event) => {
            const active = document.activeElement;
            if (active instanceof HTMLInputElement &&
                [editCostNumber.element, editSaleNumber.element].includes(active)) {
                if (!/^\d+$/.test(active.value))
                    event.preventDefault();
            }
        });
        this.elements.inputs = {
            name: editNameInput,
            barcode: editBarcodeInput,
            cost: editCostNumber,
            sale: editSaleNumber,
            stock: editStockInput,
            ncm: editNCMInput
        };
    }
    deleteItem() {
        (0, item_2.deleteItem)(this.trackingItem).then(ok => {
            if (ok) {
                this.reset();
            }
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
                    this.reset(false);
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
