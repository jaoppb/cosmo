"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("../base");
const menu_1 = require("../extra/menu");
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
    editItem() { }
    ;
    offset = 0;
    batchSize = 20;
    elements;
    menus;
    itemQuery;
    trackingItem;
    constructor(name, cssPathFile) {
        if (!Array.isArray(cssPathFile))
            cssPathFile = [cssPathFile];
        super(name, ["css/management/base.css", ...cssPathFile]);
        const menus = this.createChild("menus", "div");
        const search = this.createChild("search", "div");
        const searchBar = search.createChild("bar", "div");
        const searchInput = searchBar.createChild("input", "input");
        const searchButton = searchBar.createChild("search", "button");
        const searchButtonIcon = searchButton.createChild("icon", "i");
        searchButtonIcon.element.classList.add("fa-solid", "fa-search");
        searchButton.element.addEventListener("click", () => {
            this.queryFromInput();
        });
        const editButton = searchBar.createChild("edit", "button");
        editButton.createChild("icon", "i", ["fa-solid", "fa-pencil"]);
        const editButtonText = editButton.createChild("text", "span");
        editButtonText.element.innerText = "Editar";
        const createButton = searchBar.createChild("create", "button");
        createButton.createChild("icon", "i", ["fa-solid", "fa-plus"]);
        const createButtonText = createButton.createChild("text", "span");
        createButtonText.element.innerText = "Novo";
        createButton.element.addEventListener("click", () => {
            this.menus.create.open();
        });
        const deleteButton = searchBar.createChild("delete", "button");
        deleteButton.createChild("icon", "i", ["fa-solid", "fa-trash-can"]);
        const deleteButtonText = deleteButton.createChild("text", "span");
        deleteButtonText.element.innerText = "Apagar";
        const itemsWrapper = search.createChild("items", "div");
        const itemsHeader = itemsWrapper.createChild("header", "div");
        const itemsHeaderSelectWrapper = itemsHeader.createChild("select", "div");
        const itemsHeaderSelect = itemsHeaderSelectWrapper.createChild("input", "input");
        itemsHeaderSelect.element.type = "checkbox";
        itemsHeaderSelect.element.addEventListener("click", () => {
            itemsList.children.forEach((item) => {
                const element = item.children[0].children[0].element;
                element.checked = !element.checked;
            });
        });
        const itemsList = itemsWrapper.createChild("list", "div");
        const editButtonsData = [
            {
                text: "Apagar",
                class: "delete",
                icon: "fa-trash-can",
                confirm: true,
                handler: () => this.deleteItem()
            },
            {
                text: "Salvar",
                class: "save",
                icon: "fa-check",
                confirm: true,
                handler: () => this.saveItem()
            }
        ];
        const edit = new menu_1.default("Editar", editButtonsData, this, menus);
        const editFields = edit.elements.fields;
        const createButtonsData = [
            {
                text: "Cancelar",
                class: "delete",
                icon: "fa-xmark",
                handler: () => this.menus.create.close()
            },
            {
                text: "Criar",
                class: "save",
                icon: "fa-plus",
                handler: () => this.createItem()
            }
        ];
        const create = new menu_1.default("Criar", createButtonsData, this, menus);
        const createFields = create.elements.fields;
        itemsList.element.addEventListener("scroll", event => {
            if (itemsList.element.scrollTop / itemsList.children[0]?.element.offsetHeight > itemsList.children.length - 10) {
                this.loadItems();
            }
        });
        this.createKeyboardAction(/^Enter$/, (event) => {
            if (/keydown/.test(event.type))
                return;
            if (!this.menus.edit.check()) {
                if (document.activeElement === this.elements.search.input.element)
                    this.queryFromInput();
                else
                    this.editItem();
            }
            else
                this.menus.edit.elements.bottomButtons[1].element.click();
        });
        this.createKeyboardAction(/^Escape$/, (event) => {
            this.menus.edit.close();
        });
        this.createKeyboardAction(/^Arrow(Down|Up)$/, (event) => {
            event.preventDefault();
            if (/keydown/.test(event.type) && !event.repeat)
                return;
            const current = document.querySelector(".list .item.current");
            if (current) {
                const next = document.querySelector(event.key == "ArrowDown" ?
                    ".list .item.current + .item" :
                    ".list .item:has(+ .current)");
                const listRect = document.querySelector(".list").getBoundingClientRect();
                if (next) {
                    next.click();
                    const nextRect = next.getBoundingClientRect();
                    if (nextRect.y <= listRect.y ||
                        nextRect.bottom >= listRect.bottom) {
                        next.scrollIntoView(!event.repeat ? {
                            behavior: "smooth",
                            block: event.key == "ArrowDown" ? "end" : "start"
                        } : undefined);
                    }
                }
            }
            else
                document.querySelector(".list .item:first-child")?.click();
        });
        this.elements = {
            editMenu: {
                fields: editFields
            },
            createMenu: {
                fields: createFields
            },
            search: {
                main: search,
                input: searchInput,
                items: {
                    header: {
                        main: itemsHeader,
                        checkbox: itemsHeaderSelect,
                    },
                    list: itemsList
                },
            },
        };
        this.menus = {
            edit: edit,
            create: create,
        };
    }
    reset(search = true) {
        if (search) {
            this.clearItems();
            this.offset = 0;
            if (this.elements.search.input.element.value.length > 0)
                this.queryFromInput();
            else
                this.loadItems();
        }
        this.menus.edit.close();
        this.trackingItem = null;
    }
    clearItems() {
        this.elements.search.items.list.deleteChildren();
    }
    selectItem(item, checkbox, itemData, event) {
        if (event.target == checkbox.element)
            return;
        const current = document.querySelector(".item.current");
        if (current === undefined || current === item.element)
            return;
        if (current)
            current.classList.remove("current");
        item.element.classList.add("current");
        this.trackingItem = itemData;
    }
    load(parent) {
        super.load(parent);
        this.loadItems();
    }
    unload() {
        super.unload();
        this.reset();
    }
}
exports.default = ViewManagementBase;
