import ViewBase from "../base";
import {itemsUtils} from "../../../database";
import Item, {IItem, NCM} from "../../../database/models/item";
import {cashToInt, parseNCM, parseToCash} from "../../../shared/convert";
import {getItems, updateItem, deleteItem} from "../../../database/services/item";
import ElementHolder, {HTMLElementType} from "../../element/holder";
import ViewManagementBase, {IManagementUsedElements} from "./base";

interface IUsedElements extends IManagementUsedElements {
    inputs: {
        name: ElementHolder<HTMLElementType<"input">>,
        barcode: ElementHolder<HTMLElementType<"input">>,
        cost: ElementHolder<HTMLElementType<"input">>,
        sale: ElementHolder<HTMLElementType<"input">>,
        stock: ElementHolder<HTMLElementType<"input">>,
        ncm: ElementHolder<HTMLElementType<"input">>,
    },
}

export default class ViewManagementProducts extends ViewManagementBase {
    itemQuery: IItem = {};
    currentItem: IItem = {};
    declare elements: IUsedElements;
    constructor() {
        super("products", "./css/management/products.css");
        const placeholderItem = itemsUtils["placeholder"];

        for(const text of ["Name", "Barcode", "Cost", "Sale", "Stock", "NCM"]) {
            this.elements.search.items.header.createChild(text.toLowerCase(), "span").element.innerText = text;
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

        this.createKeyboardAction(/^[^0-9,]$/, (event: KeyboardEvent) => {
            const active = document.activeElement;

            if(event.ctrlKey || event.altKey) return;

            if (active instanceof HTMLInputElement &&
                [editCostNumber.element, editSaleNumber.element].includes(active)) {
                event.preventDefault();
            }
        });

        this.createKeyboardAction(/^,$/, (event: KeyboardEvent) => {
            const active = document.activeElement as HTMLElement;

            if (active instanceof HTMLInputElement &&
                [editCostNumber.element, editSaleNumber.element].includes(active)) {
                if(!/^\d+$/.test(active.value)) event.preventDefault()
            }
        });

        this.createKeyboardAction(/^Escape$/, (event: KeyboardEvent) => {
            this.menus.edit.close();
        });

        this.elements.inputs = {
            name: editNameInput,
            barcode: editBarcodeInput,
            cost: editCostNumber,
            sale: editSaleNumber,
            stock: editStockInput,
            ncm: editNCMInput
        }
    }

    deleteItem() {
        deleteItem(this.currentItem).then(ok => {
            if(ok) {
                this.reset();
            }
        });
    }

    saveItem() {
        try {
            const updatedItem = {
                name: this.elements.inputs.name.element.value,
                barcode: this.elements.inputs.barcode.element.value,
                "price.cost": cashToInt(this.elements.inputs.cost.element.value.replace(/[^,.0-9]/g, "")),
                "price.sale": cashToInt(this.elements.inputs.sale.element.value.replace(/[^,.0-9]/g, "")),
                stock: parseInt(this.elements.inputs.stock.element.value),
                ncm: NCM(this.elements.inputs.ncm.element.value)
            };

            updateItem(this.currentItem, updatedItem).then(ok => {
                if (ok) {
                    this.reset();
                }
            });
        } catch (err) {
            console.log(err)
        }
    }

    loadItems() {
        getItems(this.itemQuery, this.batchSize, this.offset).then(items => {
            items.forEach(item => this.renderItem(item));
        });
        this.offset += this.batchSize;
    }

    renderItem(itemData: IItem) {
        const item = this.elements.search.items.list.createChild("item", "div");

        const selection = item.createChild("select", "div");
        const input = selection.createChild("input", "input");
        input.element.type = "checkbox";

        const name = item.createChild("name", "span");
        name.element.innerText = itemData.name;

        const barcode = item.createChild("barcode", "span");
        barcode.element.innerText = itemData.barcode;

        const cost = item.createChild("cost", "span");
        const costCurrency = cost.createChild("currency", "span");
        costCurrency.element.innerText = global.user.settings.currency;
        const costNumber = cost.createChild("number", "span");
        costNumber.element.innerText = parseToCash(itemData.price.cost);

        const sale = item.createChild("sale", "span");
        const saleCurrency = sale.createChild("currency", "span");
        saleCurrency.element.innerText = global.user.settings.currency;
        const saleNumber = sale.createChild("number", "span");
        saleNumber.element.innerText = parseToCash(itemData.price.sale);

        const stock = item.createChild("stock", "span");
        stock.element.innerText = itemData.stock.toString();

        const ncm = item.createChild("ncm", "span");
        if(itemData.ncm) ncm.element.innerText = parseNCM(itemData.ncm);

        item.element.addEventListener("click", (event: MouseEvent) => {
            this.itemClick(item, input, itemData, event);
        });
    }

    queryFromInput() {
        const queryString = this.elements.search.input.element.value;
        this.clearItems();
        this.offset = 0;

        if(queryString === "") {
            this.itemQuery = {};
        } else if(queryString) {
            const query: IItem = {};
            if(/^\d+$/.test(queryString)) query.barcode = queryString;
            else query.name = queryString;

            this.itemQuery = query;
        }

        this.loadItems();
    }

    selectItem(itemData: IItem) {
        this.elements.inputs.name.element.value = itemData.name;
        this.elements.inputs.barcode.element.value = itemData.barcode;
        this.elements.inputs.cost.element.value = parseToCash(itemData.price.cost);
        this.elements.inputs.sale.element.value = parseToCash(itemData.price.sale);
        this.elements.inputs.stock.element.value = itemData.stock.toString();
        if(itemData.ncm) this.elements.inputs.ncm.element.value = parseNCM(itemData.ncm);
        this.menus.edit.open();
        this.currentItem = itemData;
    }
}