import ViewManagementBase from "./base";
import {ISale, SaleQuery} from "../../../database/models/sale";
import {getSales} from "../../../database/services/sale";
import {cashToInt, parseToCash} from "../../../shared/convert";

export default class ViewManagementSales extends ViewManagementBase {
    itemQuery: SaleQuery = {$or: [{}]};
    currentItem: ISale = {};
    constructor() {
        super("sales", "./css/management/sales.css");

        for(const text of ["Data", "Quantidade", "Valor"]) {
            this.elements.search.items.header.createChild(text.toLowerCase(), "span").element.innerText = text;
        }

        this.elements.search.input.element.placeholder = `${global.user.settings.currency}12,42; Código de Barras; Nome do Produto...`;
    }

    loadItems() {
        getSales(this.itemQuery, this.batchSize, this.offset).then(sales => {
            sales.forEach(sale => this.renderItem(sale));
        });
        this.offset += this.batchSize;
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
            this.itemClick(item, input, itemData, event);
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

    selectItem(itemData: ISale) {

        this.openEdit();
        this.currentItem = itemData;
    }
}