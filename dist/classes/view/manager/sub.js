"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
class SubViewManager extends index_1.default {
    constructor(elements, views) {
        super(elements, views);
    }
    load() {
        this.setView(this.getViews()[this.getCurrent()]);
        return true;
    }
    unload() {
        if (this.getCurrent() === undefined)
            return false;
        this.getViews()[this.getCurrent()].unload();
        return true;
    }
}
exports.default = SubViewManager;
