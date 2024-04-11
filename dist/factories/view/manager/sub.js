"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sub_1 = require("../../../classes/view/manager/sub");
const createSubViewManager = (elements, views) => new sub_1.default(elements, views);
exports.default = createSubViewManager;
