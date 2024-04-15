"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ButtonData = void 0;
const base_1 = require("../base");
class ButtonData {
    text;
    class;
    icon;
    confirm;
    handler;
    constructor(text, elementClass, icon, handler, confirm) {
        this.text = text;
        this.class = elementClass;
        this.icon = icon;
        this.confirm = confirm ?? false;
        this.handler = handler;
    }
}
exports.ButtonData = ButtonData;
class Menu {
    elements;
    constructor(title, bottomButtons, view, parent, classes = [], closeButton = true) {
        view.addCSS(new base_1.CSSInput("css/extra/menu.css", -100));
        const menuHolder = parent.createChild("holder", "div");
        const fade = menuHolder.createChild("fade", "div");
        const menu = menuHolder.createChild("menu", "div", classes);
        const menuTop = menu.createChild("top", "div");
        const menuTitle = menuTop.createChild("title", "span");
        menuTitle.element.innerText = title;
        let menuClose;
        if (closeButton) {
            menuClose = menuTop.createChild("close", "button");
            const menuCloseIcon = menuClose.createChild("icon", "i");
            menuCloseIcon.element.classList.add("fa-solid", "fa-close");
            menuClose.element.addEventListener("click", () => {
                this.close();
            });
        }
        let confirmMenu = null;
        if (bottomButtons.some(data => data.confirm)) {
            confirmMenu = new Confirm(view, parent);
        }
        const menuFields = menu.createChild("fields", "div");
        const menuBottom = menu.createChild("bottom", "div");
        const menuBottomButtons = [];
        bottomButtons.forEach(buttonData => {
            const button = menuBottom.createChild(buttonData.class, "button");
            button.createChild("icon", "i", ["fa-solid", buttonData.icon]);
            button.createChild("text", "span").element.innerText = buttonData.text;
            button.element.addEventListener("click", buttonData.confirm ? () => {
                confirmMenu.open((result) => {
                    if (result)
                        buttonData.handler();
                });
            } : buttonData.handler);
            menuBottomButtons.push(button);
        });
        this.elements = {
            menus: parent,
            main: menu,
            closeButton: menuClose,
            fields: menuFields,
            bottomButtons: menuBottomButtons,
        };
    }
    close() {
        if (!this.check())
            return;
        this.elements.main.element.classList.remove("show");
        this.elements.main.element.classList.add("hide");
        setTimeout(() => this.elements.main.element.classList.remove("hide"), 500);
        document.querySelector(".item.current")?.classList.remove("current");
        if (!this.checkMenus()) {
            this.elements.menus.element.classList.remove("show");
            this.elements.menus.element.classList.add("hide");
        }
    }
    open(...any) {
        if (this.check())
            return;
        this.elements.main.element.classList.remove("hide");
        this.elements.main.element.classList.add("show");
        if (this.checkMenus()) {
            this.elements.menus.element.classList.remove("hide");
            this.elements.menus.element.classList.add("show");
        }
    }
    check() {
        return this.elements.main.element.classList.contains("show");
    }
    checkMenus() {
        return document.querySelector(".menus:has(.show)") !== null;
    }
}
exports.default = Menu;
class Confirm extends Menu {
    callback = null;
    constructor(view, parent) {
        const confirmButtons = [
            {
                text: "Não",
                class: "cancel",
                icon: "fa-xmark",
                handler: () => this.doCallback(false),
            },
            {
                text: "Sim",
                class: "confirm",
                icon: "fa-chevron",
                handler: () => this.doCallback(true),
            }
        ];
        super("Você tem certeza?", confirmButtons, view, parent, ["confirm"], false);
    }
    doCallback(response) {
        this.callback(response);
        this.callback = null;
        this.close();
    }
    open(callback) {
        super.open();
        this.callback = callback;
        this.elements.bottomButtons[1].element.focus();
    }
}
