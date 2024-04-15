"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ViewManager {
    rootManager = false;
    views = [];
    elements;
    current;
    constructor(elements, views, rootManager) {
        this.elements = elements;
        for (const button of this.elements.tab.elements) {
            button.addEventListener("click", () => {
                this.setView(this.views[this.elements.tab.elements.indexOf(button)]);
                document.querySelector(`${elements.tab.selector}.current`)?.classList.remove("current");
                button.classList.add("current");
            });
        }
        if (rootManager)
            this.rootManager = rootManager;
        for (const view of views)
            this.subscribe(view);
    }
    clearCurrent = () => this.current = undefined;
    getCurrent = () => this.current;
    getViews = () => this.views;
    isRootManager = () => this.rootManager;
    subscribe(view) {
        this.views.push(view);
        view.setManager(this);
        return true;
    }
    unsubscribe(view) {
        if (!this.views.includes(view) ||
            this.views.indexOf(view) == this.current)
            return false;
        this.views.splice(this.views.indexOf(view), 1);
        return true;
    }
    setView(view) {
        if (!this.views.includes(view))
            return false;
        if (this.isRootManager() && this.views[this.current] == view)
            return false;
        this.views[this.current]?.unload();
        this.current = this.views.indexOf(view);
        this.views[this.current].load(this.elements.parent);
        return true;
    }
    keyboard(event) {
        this.views[this.current].keyboard(event);
    }
}
exports.default = ViewManager;
