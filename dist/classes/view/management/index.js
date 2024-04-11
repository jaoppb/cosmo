"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("../base");
const sub_1 = require("../../../factories/view/manager/sub");
const products_1 = require("../../../factories/view/management/products");
const convert_1 = require("../../../shared/convert");
const sales_1 = require("../../../factories/view/management/sales");
class ViewManagement extends base_1.default {
    constructor() {
        super("management", "./css/management/index.css");
        const tabs = this.createChild("tabs", "div");
        const tabsData = [
            {
                icon: "fa-boxes-stacked",
                name: "produtos",
                currentColor: "#EFD780"
            },
            {
                icon: "fa-arrow-trend-up",
                name: "vendas",
                currentColor: "lightblue"
            }
        ];
        tabsData.forEach((tabData, index) => {
            const tab = tabs.createChild(tabData.name, "div", index == 0 ? ["tab", "current"] : ["tab"]);
            tab.createChild("icon", "i", ["fa-solid", tabData.icon]);
            tab.element.style.setProperty("--color", tabData.currentColor);
            const span = tab.createChild("text", "span");
            span.element.innerText = (0, convert_1.title)(tabData.name);
        });
        const views = [
            (0, products_1.default)(),
            (0, sales_1.default)()
        ];
        const manager = (0, sub_1.default)({
            parent: this.getMainElement().element,
            tab: {
                elements: tabs.children.map(holder => holder.element),
                selector: ".management .tab"
            }
        }, views);
        this.setSubManager(manager);
        manager.setView(views[0]);
    }
}
exports.default = ViewManagement;
