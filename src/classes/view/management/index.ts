import ViewBase from "../base";
import createSubViewManager from "../../../factories/view/manager/sub";
import createViewManagementProducts from "../../../factories/view/management/products";
import {title} from "../../../shared/convert";
import createViewManagementSales from "../../../factories/view/management/sales";

export default class ViewManagement extends ViewBase {
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
            span.element.innerText = title(tabData.name);
        });

        const views = [
            createViewManagementProducts(),
            createViewManagementSales()
        ];
        const manager = createSubViewManager(
            {
                parent: this.getMainElement().element,
                tab: {
                    elements: tabs.children.map(holder => holder.element),
                    selector: ".management .tab"
                }
            },
            views
        );
        this.setSubManager(manager);
        manager.setView(views[0]);
    }
}