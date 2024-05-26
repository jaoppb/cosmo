import ViewBase from "../base";
import {itemsUtils} from "../../../database";
import Item, {IItem, IItemChanges, NCM} from "../../../database/models/item";
import {cashToInt, parseNCM, parseToCash} from "../../../shared/convert";
import {getItems, updateItem, deleteItem, getItem, deleteItems, createItem} from "../../../database/services/item";
import ElementHolder, {HTMLElementType} from "../../element/holder";
import ViewManagementBase, {IFieldData, IManagementUsedElements} from "./base";

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

enum FieldKeys {
    Name = "name",
    Barcode = "barcode",
    Cost = "cost",
    Sale = "sale",
    Stock = "stock",
    NCM = "ncm"
}

const fields: Record<FieldKeys, IFieldData> = {
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

export default class ViewManagementProducts extends ViewManagementBase {
    itemQuery: IItem = {};
    trackingItem: IItem = {};
    declare elements: IUsedElements;
    constructor() {
        super("products", fields, "./css/management/products.css");
        const placeholderItem = itemsUtils["placeholder"];

        this.createKeyboardAction(/^[^0-9,]$/, (event: KeyboardEvent) => {
            const active = document.activeElement;

            if(event.ctrlKey || event.altKey) return;

            if (active instanceof HTMLInputElement &&
                [this.fields.cost.elements.edit.input.element, this.fields.sale.elements.edit.input.element].includes(active)) {
                event.preventDefault();
            }
        });

        this.createKeyboardAction(/^,$/, (event: KeyboardEvent) => {
            const active = document.activeElement as HTMLElement;

            if (active instanceof HTMLInputElement &&
                [this.fields.cost.elements.edit.input.element, this.fields.sale.elements.edit.input.element].includes(active)) {
                if(!/^\d+$/.test(active.value)) event.preventDefault()
            }
        });

        this.elements.inputs = {
            name: this.fields.name.elements.edit.input,
            barcode: this.fields.barcode.elements.edit.input,
            cost: this.fields.cost.elements.edit.input,
            sale: this.fields.sale.elements.edit.input,
            stock: this.fields.stock.elements.edit.input,
            ncm: this.fields.ncm.elements.edit.input
        }

        this.dbFunctions = {
            getOne: getItem,
            getAll: getItems,
            create: createItem,
            deleteOne: deleteItem,
            deleteAll: deleteItems,
            update: updateItem,
        }
    }

    translateField(key: string) {
        if(key == "cost" || key == "sale") return `price.${key}`;
        return key;
    }

    renderItem(itemData: IItem) {
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
            this.selectItem(item, input, itemData, event);
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

    saveItem() {
        const updated: IItemChanges = {};
        const {inputs} = this.elements;
        if(this.trackingItem.name !== inputs.name.element.value) updated.name = inputs.name.element.value;
        if(this.trackingItem.barcode !== inputs.barcode.element.value) updated.barcode = inputs.barcode.element.value;
        if(parseToCash(this.trackingItem.price.cost) !== inputs.cost.element.value) updated["price.cost"] = cashToInt(inputs.cost.element.value);
        if(parseToCash(this.trackingItem.price.sale) !== inputs.sale.element.value) updated["price.sale"] = cashToInt(inputs.sale.element.value);
        if(this.trackingItem.stock !== parseInt(inputs.stock.element.value)) updated.stock = parseInt(inputs.stock.element.value);
        super.saveItem(updated);
    }

    editItem() {
        if(this.trackingItem == null) return;
        this.elements.inputs.name.element.value = this.trackingItem.name;
        this.elements.inputs.barcode.element.value = this.trackingItem.barcode;
        this.elements.inputs.cost.element.value = parseToCash(this.trackingItem.price.cost);
        this.elements.inputs.sale.element.value = parseToCash(this.trackingItem.price.sale);
        this.elements.inputs.stock.element.value = this.trackingItem.stock.toString();
        if(this.trackingItem.ncm) this.elements.inputs.ncm.element.value = parseNCM(this.trackingItem.ncm);
        this.menus.edit.open();
    }
}