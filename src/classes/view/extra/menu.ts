import ElementHolder, {HTMLElementType} from "../../element/holder";
import ViewBase from "../base";

interface IUsedElements {
    menus: ElementHolder;
    main: ElementHolder,
    closeButton: ElementHolder<HTMLElementType<"button">>,
    fields: ElementHolder<HTMLElementType<"div">>,
    bottomButtons: ElementHolder<HTMLElementType<"button">>[],
}

export interface ButtonData {
    text: string,
    class: string,
    icon: string,
    handler: () => void,
}

export default class Menu {
    elements: IUsedElements;
    constructor(title: string, bottomButtons: ButtonData[], view: ViewBase, parent: ElementHolder, classes?: string[]) {
        view.addCSS("css/extra/menu.css");
        const menuHolder = parent.createChild("holder", "div", classes);

        const fade = menuHolder.createChild("fade", "div");
        const menu = menuHolder.createChild("menu", "div", ["menu"]);
        const menuTop = menu.createChild("top", "div");

        const menuTitle = menuTop.createChild("title", "span");
        menuTitle.element.innerText = title;

        const menuClose = menuTop.createChild("close", "button");
        const menuCloseIcon = menuClose.createChild("icon", "i");
        menuCloseIcon.element.classList.add("fa-solid", "fa-close");

        menuClose.element.addEventListener("click", () => {
            this.close();
        });

        const menuFields = menu.createChild("fields", "div");

        const menuBottom = menu.createChild("bottom", "div");
        const menuBottomButtons: ElementHolder<HTMLElementType<"button">>[] = [];
        bottomButtons.forEach(buttonData => {
            const button = menuBottom.createChild(buttonData.class, "button");
            button.createChild("icon", "i", ["fa-solid", buttonData.icon]);
            button.createChild("text", "span").element.innerText = buttonData.text;
            button.element.addEventListener("click", buttonData.handler);
            menuBottomButtons.push(button);
        });

        this.elements = {
            menus: parent,
            main: menu,
            closeButton: menuClose,
            fields: menuFields,
            bottomButtons: menuBottomButtons,
        }
    }

    close() {
        if(!this.check()) return;

        this.elements.main.element.classList.remove("show");
        this.elements.main.element.classList.add("hide");
        setTimeout(() => this.elements.main.element.classList.remove("hide"), 500);
        document.querySelector(".item.current")?.classList.remove("current");

        if(!this.checkMenus()) {
            this.elements.menus.element.classList.remove("show");
            this.elements.menus.element.classList.add("hide");
        }
    }

    open() {
        if(this.check()) return;

        this.elements.main.element.classList.remove("hide");
        this.elements.main.element.classList.add("show");

        if(this.checkMenus()) {
            this.elements.menus.element.classList.remove("hide");
            this.elements.menus.element.classList.add("show");
        }
    }

    check(): boolean {
        return this.elements.main.element.classList.contains("show");
    }

    checkMenus(): boolean {
        return document.querySelector(".menus:has(.show)") !== null;
    }
}