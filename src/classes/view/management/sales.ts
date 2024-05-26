import ViewManagementBase, {IFieldData} from "./base";
import {ISale, SaleQuery} from "../../../database/models/sale";
import {createSale, deleteSale, deleteSales, getSale, getSales, updateSale} from "../../../database/services/sale";
import {cashToInt, parseToCash} from "../../../shared/convert";

enum FieldKeys {
    Date = "date",
    Quantity = "quantity",
    Value = "value",
}

const fields: Record<FieldKeys, IFieldData> = {
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
        label: "Valor",
        input: {
            currency: true,
            readonly: true,
        }
    }
};

export default class ViewManagementSales extends ViewManagementBase {
    itemQuery: SaleQuery = {$or: [{}]};
    trackingItem: ISale = {};
    constructor() {
        super("sales", fields, "./css/management/sales.css");

        this.elements.search.input.element.placeholder = `${global.user.settings.currency}12,42; Código de Barras; Nome do Produto...`;

        this.dbFunctions = {
            getOne: getSale,
            getAll: getSales,
            create: createSale,
            deleteOne: deleteSale,
            deleteAll: deleteSales,
            update: updateSale,
        };
    }

    renderItem(itemData: ISale) {
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
        priceNumber.element.innerText = parseToCash(itemData.total.price);

        item.element.addEventListener("click", (event: MouseEvent) => {
            this.selectItem(item, input, itemData, event);
        });
    }

    queryFromInput() {
        let queryString: string[] = this.elements.search.input.element.value
            .trim()
            .split(/;\s*/);
        this.clearItems();
        this.offset = 0;

        if(queryString.length == 1 && queryString[0].length == 0) {
            this.itemQuery.$or = [{}];
        } else {
            this.itemQuery.$or = [];
            for(const eachQuery of queryString) {
                const query: SaleQuery = {};
                if(new RegExp(`^${global.user.settings.currency.replace("$", "\\$")}`).test(eachQuery)) {
                    query["total.price"] = cashToInt(eachQuery.substring(2));
                } else if(/\d+,?\d*/.test(eachQuery)) {
                    query["total.price"] = cashToInt(eachQuery);
                    query["items"] = [{barcode: eachQuery}];
                } else {
                    query["items"] = [{name: eachQuery}];
                }
                this.itemQuery.$or.push(query);
            }
        }
        this.loadItems();
    }

    editItem() {
        if(this.trackingItem === null) return;
        this.menus.edit.open();
    }
}