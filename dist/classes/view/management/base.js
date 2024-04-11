"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("../base");
const convert_1 = require("../../../shared/convert");
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
    selectItem(...args) { }
    ;
    offset = 0;
    batchSize = 20;
    elements;
    menus;
    itemQuery;
    currentItem;
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
        const createButton = searchBar.createChild("create", "button");
        createButton.createChild("icon", "i", ["fa-solid", "fa-plus"]);
        const createButtonText = createButton.createChild("text", "span");
        createButtonText.element.innerText = `Novo ${(0, convert_1.title)(name)}`;
        createButton.element.addEventListener("click", () => {
            this.menus.create.open();
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
        const editButtonsData = [
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
            if (this.menus.edit.check())
                this.saveItem();
            else
                this.queryFromInput();
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
                    header: itemsHeader,
                    list: itemsList
                },
            },
        };
        this.menus = {
            edit: edit,
            create: create,
        };
    }
    reset() {
        this.clearItems();
        this.offset = 0;
        if (this.elements.search.input.element.value.length > 0)
            this.queryFromInput();
        else
            this.loadItems();
        this.menus.edit.close();
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
}
exports.default = ViewManagementBase;