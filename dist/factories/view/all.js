"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const home_1 = require("./home");
const management_1 = require("./management");
const pointOfSale_1 = require("./pointOfSale");
const settings_1 = require("./settings");
const createAllViews = () => {
    const views = [];
    views.push((0, home_1.default)(), (0, management_1.default)(), (0, pointOfSale_1.default)(), (0, settings_1.default)());
    return views;
};
exports.default = createAllViews;
