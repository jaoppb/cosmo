"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const convert_1 = require("../../shared/convert");
class ElementHolder {
    name;
    element;
    children = [];
    constructor(name, element, classes) {
        this.name = name;
        this.element = element;
        this.element.classList.add((0, convert_1.camelCaseToKebab)(name));
        if (classes)
            this.element.classList.add(...classes);
    }
    createChild(name, tag, classes) {
        const holder = new ElementHolder(name, document.createElement(tag), classes);
        this.element.appendChild(holder.element);
        this.children.push(holder);
        return holder;
    }
    createChildren(quantity, name, tag, classes) {
        const holders = [];
        for (let i = 0; i < quantity; i++) {
            holders.push(this.createChild(name, tag, classes));
        }
        return holders;
    }
    deleteChild(child) {
        if (!this.children.includes(child))
            return;
        child.element.remove();
        this.children.splice(this.children.indexOf(child), 1);
    }
    deleteChildren() {
        for (const child of this.children)
            child.element.remove();
        this.children.splice(0);
    }
}
exports.default = ElementHolder;
