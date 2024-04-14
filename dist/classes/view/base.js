"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CSSInput = void 0;
const holder_1 = require("../element/holder");
const convert_1 = require("../../shared/convert");
class CSSInput {
    filePath;
    priority = 0;
    constructor(filePath, priority) {
        this.filePath = filePath;
        if (priority)
            this.priority = priority;
    }
}
exports.CSSInput = CSSInput;
class ViewBase {
    name;
    manager;
    subManager;
    mainElement;
    css = {};
    keyboardActions = [];
    constructor(name, cssFilePaths) {
        this.name = (0, convert_1.camelCaseToKebab)(name);
        this.mainElement = new holder_1.default(this.name, document.createElement("div"));
        if (cssFilePaths)
            this.addCSS(cssFilePaths);
    }
    getMainElement = () => this.mainElement;
    checkCSS(cssPath) {
        return Object.values(this.css).some(dataArray => dataArray.some(data => data.filePath == cssPath));
    }
    addCSS(cssInputs) {
        if (!Array.isArray(cssInputs))
            cssInputs = [cssInputs];
        let result = 0;
        for (const cssInput of cssInputs.map(cssFilePath => {
            if (cssFilePath instanceof CSSInput)
                return cssFilePath;
            else
                return new CSSInput(cssFilePath);
        })) {
            if (this.checkCSS(cssInput.filePath))
                continue;
            const linkElement = document.createElement("link");
            linkElement.rel = "stylesheet";
            linkElement.type = "text/css";
            linkElement.href = cssInput.filePath;
            if (this.css[cssInput.priority ?? 0] == undefined)
                this.css[cssInput.priority ?? 0] = [];
            this.css[cssInput.priority ?? 0].push({
                filePath: cssInput.filePath,
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
        if (Object.values(this.css).length > 0) {
            const keys = Object.keys(this.css).map(key => parseInt(key)).toSorted();
            keys.forEach(key => this.css[key].forEach(css => document.head.appendChild(css.element)));
        }
        if (this.manager.isRootManager())
            document.title = (0, convert_1.camelCaseToTitle)(this.name);
        if (this.subManager)
            this.subManager.load();
        setTimeout(() => parent.appendChild(this.mainElement.element), 10);
    }
    unload() {
        this.mainElement.element.remove();
        if (Object.values(this.css).length > 0) {
            Object.values(this.css).forEach(cssArray => cssArray.forEach(css => css.element.remove()));
        }
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
