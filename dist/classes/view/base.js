"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const holder_1 = require("../element/holder");
const convert_1 = require("../../shared/convert");
class ViewBase {
    name;
    manager;
    subManager;
    mainElement;
    css = [];
    keyboardActions = [];
    constructor(name, cssFilePaths) {
        this.name = (0, convert_1.camelCaseToKebab)(name);
        this.mainElement = new holder_1.default(this.name, document.createElement("div"));
        if (cssFilePaths) {
            if (!Array.isArray(cssFilePaths))
                cssFilePaths = [cssFilePaths];
            this.addCSS(...cssFilePaths);
        }
    }
    getMainElement = () => this.mainElement;
    checkCSS(cssPath) {
        return this.css.some(data => data.filePath == cssPath);
    }
    addCSS(...cssPaths) {
        let result = 0;
        for (const cssPath of cssPaths) {
            if (this.checkCSS(cssPath))
                continue;
            const linkElement = document.createElement("link");
            linkElement.rel = "stylesheet";
            linkElement.type = "text/css";
            linkElement.href = cssPath;
            this.css.push({
                filePath: cssPath,
                element: linkElement,
            });
            result++;
        }
        return result;
    }
    createKeyboardAction(regex, action) {
        this.keyboardActions.push([regex, action]);
    }
    createChild(name, tag, classes) {
        return this.mainElement.createChild(name, tag, classes);
    }
    createChildren(quantity, name, tag, classes) {
        return this.mainElement.createChildren(quantity, name, tag);
    }
    load(parent) {
        if (this.css.length)
            this.css.forEach(css => document.head.appendChild(css.element));
        if (this.manager.isRootManager())
            document.title = (0, convert_1.camelCaseToTitle)(this.name);
        if (this.subManager)
            this.subManager.load();
        setTimeout(() => parent.appendChild(this.mainElement.element), 10);
    }
    unload() {
        this.mainElement.element.remove();
        if (this.css.length)
            this.css.forEach(css => css.element.remove());
        if (this.subManager)
            this.subManager.unload();
    }
    setManager(manager) {
        this.manager = manager;
    }
    setSubManager(manager) {
        this.subManager = manager;
    }
    keyboard(event) {
        if (this.subManager)
            this.subManager.keyboard(event);
        const { key } = event;
        for (const action of this.keyboardActions) {
            if (action[0].test(key))
                action[1](event);
        }
    }
}
exports.default = ViewBase;
