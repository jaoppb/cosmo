"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const manager_1 = require("./factories/view/manager");
const all_1 = require("./factories/view/all");
const keyboard_1 = require("./classes/handler/keyboard");
const database_1 = require("./database");
const user_1 = require("./database/services/user");
const user_2 = require("./database/models/user");
const keyboardHandler = new keyboard_1.default();
window.addEventListener("keydown", event => keyboardHandler.trigger(event));
window.addEventListener("keyup", event => keyboardHandler.trigger(event));
(async () => {
    await (0, database_1.default)();
    global.user = await (0, user_1.getLastLoggedUser)();
    if (global.user === null) {
        await (0, user_1.createUser)(new user_2.default("default"));
    }
})();
window.onload = () => {
    const elements = {
        parent: document.querySelector("main"),
        tab: {
            elements: Array.from(document.querySelectorAll("nav .view")),
            selector: "nav .view"
        },
    };
    const views = (0, all_1.default)();
    const viewManager = (0, manager_1.default)(elements, views, true);
    viewManager.setView(views[1]);
    keyboardHandler.subscribe(viewManager);
};
