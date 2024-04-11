import ViewManager, {ViewManagerElements} from "./index";
import ViewBase from "../base";

export default class SubViewManager extends ViewManager {
    constructor(elements: ViewManagerElements, views: ViewBase[]) {
        super(elements, views);
    }

    load() {
        this.setView(this.getViews()[this.getCurrent()]);
        return true;
    }

    unload() {
        if(this.getCurrent() === undefined) return false;
        this.getViews()[this.getCurrent()].unload();
        this.clearCurrent();
        return true;
    }
}