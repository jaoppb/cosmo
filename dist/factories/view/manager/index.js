"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const manager_1 = require("../../../classes/view/manager");
function createViewManager(elements, views, rootManager) {
    return new manager_1.default(elements, views, rootManager);
}
exports.default = createViewManager;
