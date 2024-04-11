"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("../base");
const convert_1 = require("../../../shared/convert");
class ViewManagementBase extends base_1.default {
    queryFromInput() { }
    ;
    saveItem() { }
    ;
    createItem() { }
    ;
    deleteItem() { }
    ;
    loadItems() { }
    ;
    selectItem(...args) { }
    ;
    offset = 0;
    batchSize = 20;
    elements;
    itemQuery;
    currentItem;
    constructor(name, cssPathFile) {
        if (!Array.isArray(cssPathFile))
            cssPathFile = [cssPathFile];
        super(name, ["css/management/base.css", ...cssPathFile]);
        const search = this.createChild("search", "div");
        const searchBar = search.createChild("bar", "div");
        const searchInput = searchBar.createChild("input", "input");
        const searchButton = searchBar.createChild("search", "button");
        const searchButtonIcon = searchButton.createChild("icon", "i");
        searchButtonIcon.element.classList.add("fa-solid", "fa-search");
        searchButton.element.addEventListener("click", () => {
            this.queryFromInput();
        });
        const createButton = searchBar.createChild("create", "button");
        createButton.createChild("icon", "i", ["fa-solid", "fa-plus"]);
        const createButtonText = createButton.createChild("text", "span");
        createButtonText.element.innerText = `Novo ${(0, convert_1.title)(name)}`;
        createButton.element.addEventListener("click", () => {
            this.openCreate();
        });
        const deleteButton = searchBar.createChild("delete", "button");
        deleteButton.createChild("icon", "i", ["fa-solid", "fa-trash-can"]);
        const deleteButtonText = deleteButton.createChild("text", "span");
        deleteButtonText.element.innerText = `Apagar ${(0, convert_1.title)(name)}`;
        const itemsWrapper = search.createChild("items", "div");
        const itemsHeader = itemsWrapper.createChild("header", "div");
        const itemsHeaderSelectWrapper = itemsHeader.createChild("select", "div");
        const itemsHeaderSelect = itemsHeaderSelectWrapper.createChild("input", "input");
        itemsHeaderSelect.element.type = "checkbox";
        const itemsList = itemsWrapper.createChild("list", "div");
        const fade = this.createChild("fade", "div");
        const edit = this.createChild("edit", "div", ["menu"]);
        const editTop = edit.createChild("top", "div");
        const editTitle = editTop.createChild("title", "span");
        editTitle.element.innerText = "Editar";
        const editClose = editTop.createChild("close", "div");
        const editCloseIcon = editClose.createChild("icon", "i");
        editCloseIcon.element.classList.add("fa-solid", "fa-close");
        editClose.element.addEventListener("click", () => {
            this.closeEdit();
        });
        const editFields = edit.createChild("fields", "div");
        const editBottom = edit.createChild("bottom", "div");
        [
            {
                text: "Apagar",
                class: "delete",
                icon: "fa-trash-can",
                handler: () => this.deleteItem()
            },
            {
                text: "Salvar",
                class: "save",
                icon: "fa-check",
                handler: () => this.createItem()
            }
        ].forEach(buttonData => {
            const button = editBottom.createChild(buttonData.class, "button");
            button.createChild("icon", "i", ["fa-solid", buttonData.icon]);
            button.createChild("text", "span").element.innerText = buttonData.text;
            button.element.addEventListener("click", buttonData.handler);
        });
        const create = this.createChild("create", "div", ["menu"]);
        const createTop = create.createChild("top", "div");
        const createTitle = createTop.createChild("title", "span");
        createTitle.element.innerText = "Criar";
        const createClose = createTop.createChild("close", "div");
        const createCloseIcon = createClose.createChild("icon", "i");
        createCloseIcon.element.classList.add("fa-solid", "fa-close");
        createClose.element.addEventListener("click", () => {
            this.closeCreate();
        });
        const createFields = create.createChild("fields", "div");
        const createBottom = create.createChild("bottom", "div");
        [
            {
                text: "Cancelar",
                class: "delete",
                icon: "fa-xmark",
                handler: () => this.closeCreate()
            },
            {
                text: "Criar",
                class: "save",
                icon: "fa-plus",
                handler: () => this.createItem()
            }
        ].forEach(buttonData => {
            const button = createBottom.createChild(buttonData.class, "button");
            button.createChild("icon", "i", ["fa-solid", buttonData.icon]);
            button.createChild("text", "span").element.innerText = buttonData.text;
            button.element.addEventListener("click", buttonData.handler);
        });
        itemsList.element.addEventListener("scroll", event => {
            if (itemsList.element.scrollTop / itemsList.children[0]?.element.offsetHeight > itemsList.children.length - 10) {
                this.loadItems();
            }
        });
        this.createKeyboardAction(/^Enter$/, (event) => {
            if (/keydown/.test(event.type))
                return;
            if (this.checkEdit())
                this.saveItem();
            else
                this.queryFromInput();
        });
        this.elements = {
            editMenu: {
                main: edit,
                fields: editFields
            },
            createMenu: {
                main: create,
                fields: createFields
            },
            search: {
                main: search,
                input: searchInput,
                items: {
                    header: itemsHeader,
                    list: itemsList
                },
            },
        };
    }
    reset() {
        this.clearItems();
        this.offset = 0;
        if (this.elements.search.input.element.value.length > 0)
            this.queryFromInput();
        else
            this.loadItems();
        this.closeEdit();
    }
    clearItems() {
        this.elements.search.items.list.deleteChildren();
    }
    itemClick(item, checkbox, itemData, event) {
        if (event.target == checkbox.element)
            return;
        const current = document.querySelector(".item.current");
        if (current === undefined || current === item.element)
            return;
        if (current)
            current.classList.remove("current");
        item.element.classList.add("current");
        this.selectItem(itemData);
    }
    load(parent) {
        super.load(parent);
        this.loadItems();
    }
    unload() {
        super.unload();
        this.clearItems();
    }
    checkEdit() {
        return this.elements.editMenu.main.element.classList.contains("show");
    }
    checkCreate() {
        return this.elements.createMenu.main.element.classList.contains("show");
    }
    openEdit() {
        if (this.checkEdit())
            return;
        this.elements.editMenu.main.element.classList.remove("hide");
        this.elements.editMenu.main.element.classList.add("show");
    }
    closeEdit() {
        if (!this.checkEdit())
            return;
        this.elements.editMenu.main.element.classList.remove("show");
        this.elements.editMenu.main.element.classList.add("hide");
        setTimeout(() => this.elements.editMenu.main.element.classList.remove("hide"), 500);
        document.querySelector(".item.current")?.classList.remove("current");
    }
    openCreate() {
        if (this.checkCreate())
            return;
        this.elements.createMenu.main.element.classList.remove("hide");
        this.elements.createMenu.main.element.classList.add("show");
    }
    closeCreate() {
        if (!this.checkCreate())
            return;
        this.elements.createMenu.main.element.classList.remove("show");
        this.elements.createMenu.main.element.classList.add("hide");
        setTimeout(() => this.elements.createMenu.main.element.classList.remove("hide"), 500);
        document.querySelector(".item.current")?.classList.remove("current");
    }
}
exports.default = ViewManagementBase;
