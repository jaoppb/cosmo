import ViewBase from "../base";
import ElementHolder, {HTMLElementType} from "../../element/holder";
import {CollectionTypes} from "../../../database";
import Menu, {Confirm, ButtonData} from "../extra/menu";

export interface IManagementUsedElements {
    editMenu: {
        fields: ElementHolder,
    },
    createMenu: {
        fields: ElementHolder,
    },
    search: {
        main: ElementHolder,
        input: ElementHolder<HTMLElementType<"input">>,
        items: {
            header: {
                main: ElementHolder,
                buttons: ElementHolder<HTMLElementType<"button">>[],
                checkbox: ElementHolder<HTMLElementType<"input">>,
            },
            list: ElementHolder
        },
    },
}

interface IUsedMenu {
    edit: Menu,
    create: Menu,
}

export default class ViewManagementBase extends ViewBase {
    queryFromInput(): void {};
    saveItem(): void {};
    createItem(): void {};
    deleteItem(itemQuery?: CollectionTypes): void {};
    loadItems(): void {};
    editItem(): void {};
    offset: number = 0;
    batchSize: number = 20;
    elements: IManagementUsedElements;
    menus: IUsedMenu;
    itemQuery: CollectionTypes;
    trackingItem: CollectionTypes;

    constructor(name: string, cssPathFile?: string | string[]) {
        if(!Array.isArray(cssPathFile)) cssPathFile = [cssPathFile];
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

        editButton.element.addEventListener("click", () => {
            this.editItem();
        });

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

        const confirmDelete = new Confirm(this, menus);
        deleteButton.element.addEventListener("click", () => {
            confirmDelete.open((result) => {
                if(!result) return;
                if(itemsHeaderSelect.element.checked) {
                    this.deleteItem(this.itemQuery);
                } else this.deleteItem();
            });
        });

        const headerButtons = [editButton, deleteButton];
        headerButtons.forEach(button => {
            button.element.disabled = true;
        });

        const itemsWrapper = search.createChild("items", "div");
        const itemsHeader = itemsWrapper.createChild("header", "div");

        const itemsHeaderSelectWrapper = itemsHeader.createChild("select", "div");
        const itemsHeaderSelect = itemsHeaderSelectWrapper.createChild("input", "input");
        itemsHeaderSelect.element.type = "checkbox";

        itemsHeaderSelect.element.addEventListener("click", () => {
            itemsList.children.forEach((item) => {
                const element = item.children[0].children[0].element as HTMLElementType<"input">;
                element.checked = !element.checked;
                if (document.querySelector(".list .item.current") == null &&
                    element.checked)
                    this.elements.search.items.header.buttons.forEach(button => button.element.disabled = false)
            });
        });

        const itemsList = itemsWrapper.createChild("list", "div");

        const editButtonsData: ButtonData[] = [
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
        const edit = new Menu("Editar", editButtonsData, this, menus);
        const editFields = edit.elements.fields;

        const createButtonsData: ButtonData[] = [
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
        const create = new Menu("Criar", createButtonsData, this, menus);
        const createFields = create.elements.fields;

        itemsList.element.addEventListener("scroll", event => {
            if(itemsList.element.scrollTop / itemsList.children[0]?.element.offsetHeight > itemsList.children.length - 10) {
                this.loadItems();
            }
        });

        this.createKeyboardAction(/^Enter$/, (event: KeyboardEvent) => {
            if(/keydown/.test(event.type)) return;

            if(!this.menus.edit.check()) {
                if(document.activeElement === this.elements.search.input.element) this.queryFromInput();
                else this.editItem();
            } else this.menus.edit.elements.bottomButtons[1].element.click();
        });

        this.createKeyboardAction(/^Escape$/, (event: KeyboardEvent) => {
            this.menus.edit.close();
        });

        this.createKeyboardAction(/^Arrow(Down|Up)$/, (event: KeyboardEvent) => {
            event.preventDefault();
            if(/keydown/.test(event.type) && !event.repeat) return;

            const current = document.querySelector(".list .item.current");
            if(current) {
                const next = document.querySelector(
                    event.key == "ArrowDown" ?
                        ".list .item.current + .item" :
                        ".list .item:has(+ .current)"
                ) as HTMLElement;
                const listRect = (document.querySelector(".list") as HTMLElement).getBoundingClientRect();
                if (next) {
                    next.click();
                    const nextRect = next.getBoundingClientRect();
                    if (
                        nextRect.y <= listRect.y ||
                        nextRect.bottom >= listRect.bottom
                    ) {
                        next.scrollIntoView(!event.repeat ? {
                            behavior: "smooth",
                            block: event.key == "ArrowDown" ? "end" : "start"
                        } : undefined);
                    }
                }
            } else (document.querySelector(".list .item:first-child") as HTMLElement)?.click()
        })

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
                        buttons: headerButtons,
                        checkbox: itemsHeaderSelect,
                    },
                    list: itemsList
                },
            },
        };
        this.menus = {
            edit: edit,
            create: create,
        }
    }

    reset() {
        this.clearItems();
        this.offset = 0;
        if (this.elements.search.input.element.value.length > 0) this.queryFromInput();
        else this.loadItems();
        this.trackingItem = null;
        this.elements.search.items.header.buttons.forEach(button => {
            button.element.disabled = true;
        });
        this.elements.search.items.header.checkbox.element.checked = false;
        Object.values(this.menus).forEach(menu => menu.close());
    }

    clearItems() {
        this.elements.search.items.list.deleteChildren();
    }

    selectItem(item: ElementHolder, checkbox: ElementHolder, itemData: CollectionTypes, event: MouseEvent) {
        if(document.querySelector(".list .item.current, .list .item:has(input:checked)") == null) {
            this.elements.search.items.header.buttons.forEach(button => {
                button.element.disabled = true;
            });
        }
        this.elements.search.items.header.buttons.forEach(button => {
            button.element.disabled = false;
        });
        if(event.target == checkbox.element) return;
        const current = document.querySelector(".item.current");
        if(current === undefined || current === item.element) return;
        if(current) current.classList.remove("current");
        item.element.classList.add("current");
        this.trackingItem = itemData;
    }

    load(parent: HTMLElement) {
        super.load(parent);
        this.loadItems();
    }

    unload() {
        super.unload();
        this.reset();
    }
}