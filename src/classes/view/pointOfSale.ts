import ViewBase from "./base";
import {Input} from "electron";
import {cashToInt, parseToCash} from "../../shared/convert";
import {IItem, ItemData} from "../../database/models/item";
import * as itemAPI from "../../database/services/item"
import ElementHolder, {HTMLElementType} from "../element/holder";
import {createSale} from "../../database/services/sale";
import Sale, {PaymentInfo} from "../../database/models/sale";

interface IUsedElements {
    payment: {
        main: ElementHolder,
        types: ElementHolder[],
        holders: ElementHolder[]
    },
    lastItem: {
        name: ElementHolder,
        quantity: ElementHolder,
        stock: ElementHolder,
        price: ElementHolder,
    },
    itemsList: ElementHolder,
    total: {
        quantity: ElementHolder,
        price: ElementHolder
    },
    buttonHolders: ElementHolder<HTMLElementType<"button">>[],
    actionButtons: {
        deleteItem: {
            main: ElementHolder<HTMLElementType<"button">>,
            state: ElementHolder<HTMLElementType<"span">>
        },
        openPayment: ElementHolder<HTMLElementType<"button">>
    }
}

export default class ViewPointOfSale extends ViewBase {
    itemsData: ItemData[] = [];
    elements: IUsedElements;
    total: {
        quantity: number,
        price: number,
        paid: number,
    }
    constructor() {
        super("pointOfSale", "./css/point-of-sale.css");

        /*  Elements for the main part  */
        const leftSection = this.createChild("leftSection", "div");

        const search = leftSection.createChild("search", "input");
        const searchElement = search.element
        searchElement.type = "text";

        const lastItem = leftSection.createChild("lastItem", "div");
        const itemName = lastItem.createChild("itemName", "span");

        const itemQuantity = lastItem.createChild("quantity", "div");
        const itemQuantityText = itemQuantity.createChild("text", "span");
        itemQuantityText.element.innerText = "Quantidade: ";
        const itemQuantityNumber = itemQuantity.createChild("number", "span");

        const itemStock = lastItem.createChild("quantity", "div");
        const itemStockText = itemStock.createChild("text", "span");
        itemStockText.element.innerText = "Restante: ";
        const itemStockNumber = itemStock.createChild("number", "span");

        const itemPrice = lastItem.createChild("price", "div");
        const itemPriceText = itemPrice.createChild("text", "span");
        itemPriceText.element.innerText = "Preço/UN: ";
        const itemPriceValue = itemPrice.createChild("value", "span");
        const itemPriceCurrency = itemPriceValue.createChild("currency", "span");
        itemPriceCurrency.element.innerText = global.user.settings.currency;
        this.setLastItem().then();

        const itemPriceNumber = itemPriceValue.createChild("value", "span");

        const rightSection = this.createChild("rightSection", "div");

        const itemsHolder = rightSection.createChild("items-list", "div");

        const total = rightSection.createChild("total", "div");
        const totalQuantity = total.createChild("quantity", "span");
        const totalQuantityText = totalQuantity.createChild("text", "span");
        totalQuantityText.element.innerText = "Quantidade: "
        const totalQuantityNumber = totalQuantity.createChild("number", "span");
        totalQuantityNumber.element.innerText = "0";
        const totalPrice = total.createChild("price", "span");
        const totalPriceCurrency = totalPrice.createChild("currency", "span");
        totalPriceCurrency.element.innerText = global.user.settings.currency;
        const totalPriceNumber = totalPrice.createChild("number", "span");
        totalPriceNumber.element.innerText = "0,00";

        const downSection = this.createChild("down-section", "div");
        const actionButtons = downSection.createChildren(2, "button", "button");
        const actionButtonsData = [
            {
                text: "Deletar ",
                action: () => this.deleteCurrent(),
                disabled: true,
                hover: {
                    background: "#e01919",
                    color: "white"
                },
                initialState: "1",
                hotkey: "Del"
            },
            {
                text: "Tela de Pagamento",
                action: () => this.openPayments(),
                hover: {
                    background: "#069E2D",
                    color: "white"
                },
                disabled: true,
                hotkey: "F12"
            }
        ];
        actionButtonsData.forEach((data, index) => {
            const button = actionButtons[index];
            const element = button.element;
            element.addEventListener("click", data.action);
            element.style.setProperty("--hover-bg", data.hover.background);
            element.style.setProperty("--hover-color", data.hover.color);
            if(data.disabled) element.disabled = true;

            const top = button.createChild("top", "div");
            top.createChild("text", "span").element.innerText = data.text;
            if(data.initialState) top.createChild("state", "span").element.innerText = data.initialState;
            if(data.hotkey) button.createChild("hotkey", "span").element.innerText = `(${data.hotkey})`;
        });

        /* Elements for submit a sale */

        this.createChild("fade", "div");
        const payment = this.createChild("payment", "div");
        const paymentTitle = payment.createChild("title", "span");
        paymentTitle.element.innerText = "Tela de Pagamento";
        const paymentTypesWrapper = payment.createChild("types", "div");
        const paymentTypes = paymentTypesWrapper.createChildren(global.user.settings.paymentTypes.length, "type", "div");
        paymentTypes.forEach((paymentType, index) => {
            paymentType.createChild("name", "span").element.innerText = global.user.settings.paymentTypes[index];
            paymentType.createChild("currency", "span").element.innerText = global.user.settings.currency;
            const input = paymentType.createChild("value", "input");
            input.element.placeholder = "0,00";
        });

        const paymentResult = payment.createChild("result", "div");
        const paymentData = [
            {
                color: "#157F1F",
                text: "Total"
            },
            {
                color: "#DD403A",
                text: "Troco"
            }
        ];
        const paymentHolders = paymentResult.createChildren(2, "wrapper", "div");
        for(const holder of paymentHolders) {
            const index = paymentHolders.indexOf(holder);
            const text = holder.createChild("text", "span");
            text.element.innerText = `${paymentData[index].text}:`;
            text.element.style.setProperty("--back-color", paymentData[index].color);
            holder.createChild("currency", "span").element.innerText = global.user.settings.currency;
            holder.createChild("number", "span");
        }

        const buttons = paymentResult.createChild("buttons", "div");
        const buttonsData = [
            {
                color: "#e01919",
                icon: "xmark",
                text: "Cancelar",
                handler: () => this.closePayments()
            },
            {
                color: "#069E2D",
                icon: "check",
                text: "Finalizar",
                handler: () => this.finalizePurchase()
            }
        ]
        const buttonHolders = buttons.createChildren(buttonsData.length, "button", "button");
        for(const index in buttonHolders) {
            const buttonData = buttonsData[index]
            const holder = buttonHolders[index];
            holder.createChild("icon", "i", ["fa-solid", `fa-${buttonData.icon}`]);
            const text = holder.createChild("text", "span");
            holder.element.style.setProperty("--color", buttonData.color);
            text.element.innerText = buttonData.text;
            holder.element.addEventListener("click", buttonData.handler)
        }

        this.createKeyboardAction(/^[a-zA-Z0-9]$/, () => {
            const active = document.activeElement;

            if (active !== searchElement &&
                !this.checkPayment()) searchElement.focus();
        })

        this.createKeyboardAction(/^\d$/, (event: KeyboardEvent) => {
            const active = document.activeElement as HTMLElement;

            if(active === searchElement) {
                if (/^\d+$/.test(searchElement.value)) searchElement.maxLength = 13;
                if (/^\d+\*\d+$/.test(searchElement.value)) {
                    searchElement.maxLength = searchElement.value.split("*")[0].length + 14;
                }
            } else if(this.checkPayment()) {
                const paymentInput = paymentTypes
                    .map(type => type.children[2].element)
                    .find(element => element == active) as HTMLInputElement;
                if(!paymentInput) paymentTypes[0].children[2].element.focus();
                else {
                    if (/^\d+,\d{2}$/.test(paymentInput.value) &&
                        !(paymentInput.selectionStart == 0 &&
                          paymentInput.selectionEnd == paymentInput.value.length)
                    ) event.preventDefault();
                }
            }
        });

        this.createKeyboardAction(/.+/, (event: KeyboardEvent) => {
            const active = document.activeElement;
            const paymentInput = paymentTypes
                .map(type => type.children[2].element as HTMLElementType<"input">)
                .find(element => element == active);
            if(active === searchElement) {
                const notAllowed = /[^a-zA-Z0-9*]/g;
                if(notAllowed.test(event.key)) event.preventDefault();
                searchElement.value = searchElement.value.replace(notAllowed, "");
            } else if(active == paymentInput) {
                const allowed = /\d|Backspace|Delete|Arrow(Left|Right)|,/g;
                if(!allowed.test(event.key)) event.preventDefault();
                if (/,/.test(event.key) &&
                    !/^\d+$/.test(paymentInput.value)) event.preventDefault();
            }
        })

        this.createKeyboardAction(/\*/, (event: KeyboardEvent) => {
            if(/\*+/.test(searchElement.value) ||
                !/^\d+$/.test(searchElement.value)) event.preventDefault();
        })

        this.createKeyboardAction(/,/, (event: KeyboardEvent) => {
            if(this.checkPayment()) {
                const active = document.activeElement as HTMLInputElement;
                if(!paymentTypes.map(type => type.children[2].element).includes(active)) return;

                if(/^\d+,/.test(active.value)) event.preventDefault();
            }
        })

        this.createKeyboardAction(/^[a-zA-Z]$/, () => {
            const active = document.activeElement;

            if(active === searchElement) searchElement.maxLength = 100;
        });

        this.createKeyboardAction(/^F12$/, (event: KeyboardEvent) => {
            if(/keydown/.test(event.type)) return;
            this.openPayments();
        });

        this.createKeyboardAction(/^Escape$/, () => {
            if(this.checkPayment()) this.closePayments();
        });

        this.createKeyboardAction(/^Tab$/, (event: KeyboardEvent) => {
            if(!/keyup/.test(event.key)) return;

            if(this.checkPayment()) {
                this.parseActivePaymentInput();
            }
        })

        this.createKeyboardAction(/^Enter$/, async (event: Input) => {
            if(/keydown/.test(event.type)) return;

            if(this.checkPayment()) {
                this.parseActivePaymentInput();

            } else {
                let quantity: number = 1,
                    queryString: string = searchElement.value,
                    query: IItem;
                if(/^\d+\*\d+$/.test(queryString)) {
                    const arr = queryString.split("*");
                    quantity = parseInt(arr[0]);
                    queryString = arr[1];
                }

                if(/^[a-zA-Z ]+$/g.test(queryString)) query = {name: queryString}
                else if(/^\d+$/g.test(queryString)) query = {barcode: queryString}
                else return;

                const item = await itemAPI.getItem(query);
                if(!item) return;
                const itemData = new ItemData(item, quantity);
                itemData.quantity = quantity;
                this.appendItem(itemData);
                this.setLastItem(itemData).then();
                this.setTotal();
                this.clearSelection();
                searchElement.value = "";
            }
        });

        this.createKeyboardAction(/^Delete$/, (event: KeyboardEvent) => {
            if(/keydown/.test(event.type)) return;
            if(this.checkPayment()) return;

            this.deleteCurrent(event.ctrlKey);
            if(event.ctrlKey) {
                const current = document.querySelector(".item.current");
                const itemData = this.itemsData.find(data => data.holder.element == current);

                this.elements.actionButtons.deleteItem.state.element.innerText = itemData?.quantity.toString() ?? "1";
            }
        });

        this.createKeyboardAction(/^Control$/, (event: KeyboardEvent) => {
            if(this.checkPayment()) return;

            switch(event.type) {
                case "keydown":
                    const current = document.querySelector(".item.current");
                    const itemData = this.itemsData.find(data => data.holder.element == current);

                    this.elements.actionButtons.deleteItem.state.element.innerText = itemData?.quantity.toString() ?? "1";
                    break;
                case "keyup":
                    this.elements.actionButtons.deleteItem.state.element.innerText = "1"
                    break;
            }
        });
        
        this.elements = {
            payment: {
                main: payment,
                types: paymentTypes,
                holders: paymentHolders
            },
            lastItem: {
                name: itemName,
                quantity: itemQuantityNumber,
                stock: itemStockNumber,
                price: itemPriceNumber,
            },
            itemsList: itemsHolder,
            total: {
                quantity: totalQuantityNumber,
                price: totalPriceNumber
            },
            buttonHolders: buttonHolders,
            actionButtons: {
                deleteItem: {
                    main: actionButtons[0],
                    state: actionButtons[0].children[0].children[1]
                },
                openPayment: actionButtons[1]
            }
        }
    }

    async reset() {
        this.deleteAllItems();
        this.closePayments();
        this.setTotal();
        await this.setLastItem();
    }

    checkPayment(): boolean {
        /* 0 - Hidden
        *  1 - Visible
        * */
        return this.elements.payment.main.element.classList.contains("visible");
    }

    deleteCurrent(all: boolean = false) {
        const selectedItem = document.querySelector(".items-list .item.current") as HTMLElement;
        if(!selectedItem) return;

        const itemData = this.itemsData.find(data => data.holder.element == selectedItem);
        const itemIndex = this.itemsData.indexOf(itemData);
        if(itemData.quantity == 1 || all) {
            this.deleteItem(itemData);
            this.selectItem(Math.min(itemIndex, this.itemsData.length - 1));
        } else {
            itemData.quantity--;
            this.updateItem(itemData);
            this.setLastItem(itemData).then();
        }
        this.setTotal();
    }

    async finalizePurchase() {
        const total = this.getTotal();
        const info: PaymentInfo = {
            types: {},
            result: {
                quantity: total.quantity,
                paid: total.paid,
                price: total.price,
            },
        };
        this.elements.payment.types.forEach(
            (holder, index) => {
                const value = (holder.children[2] as ElementHolder<HTMLElementType<"input">>).element.value;
                info.types[global.user.settings.paymentTypes[index]] = cashToInt(value);
            }
        );
        this.itemsData.forEach(itemData => delete itemData.holder)
        const sale = new Sale(this.itemsData, info);
        await createSale(sale);
        await this.reset();
    }

    async setLastItem(item?: ItemData) {
        if(item == undefined) {
            await itemAPI.getItem({name: "Nenhum"}).then(response =>
                item = new ItemData(response, 0)
            );
        }
        const found = this.itemsData.find(data => data._id.toHexString() == item._id.toHexString());
        let stock: number, total: number;
        if(found) {
            stock = (found.stock - found.quantity);
            total = found.quantity;
        } else {
            stock = (item.stock - item.quantity);
            total = item.quantity;
        }
        this.elements.lastItem.name.element.innerText = item.name.toLowerCase();
        this.elements.lastItem.quantity.element.innerText = total.toString();
        this.elements.lastItem.stock.element.innerText = stock.toString();
        this.elements.lastItem.price.element.innerText = parseToCash(item.price.sale);
    }

    getTotal() {
        this.total = {
            quantity: 0,
            price: 0,
            paid: 0
        };

        this.itemsData.forEach(itemData => {
            this.total.quantity += itemData.quantity;
            this.total.price += itemData.price.sale * itemData.quantity;
        });

        if(this.checkPayment()) {
            this.elements.payment.types.forEach(type => {
                const {value} = type.children[2].element as HTMLInputElement;
                this.total.paid += value.length ? cashToInt(value) : 0;
            });
        }

        return this.total;
    }

    setTotal() {
        const total = this.getTotal();

        this.elements.total.quantity.element.innerText = total.quantity.toString();
        this.elements.total.price.element.innerText = parseToCash(total.price);
    }

    openPayments() {
        if (this.itemsData.length == 0 ||
            this.checkPayment()) return;

        this.elements.payment.types.forEach(type => {
            (type.children[2].element as HTMLInputElement).value = "";
        });

        this.elements.payment.main.element.classList.remove("hidden");
        this.elements.payment.main.element.classList.add("visible");
        this.elements.payment.types[0].children[2].element.focus();
        this.setResult();
    }

    closePayments() {
        this.elements.payment.main.element.classList.remove("visible");
        this.elements.payment.main.element.classList.add("hidden");
        this.clearPayments();
    }

    clearPayments() {
        this.elements.payment.types.forEach(holder => {
            (holder.children[2] as ElementHolder<HTMLElementType<"input">>).element.value = "";
        });
    }

    setResult() {
        const total = this.getTotal();

        this.elements.payment.holders[0].children[2].element.innerText = parseToCash(total.price);
        this.elements.payment.holders[1].children[2].element.innerText = parseToCash(this.total.paid - total.price);

        return {
            price: total.price,
            paid: this.total.paid
        };
    }

    parseActivePaymentInput() {
        const active = document.activeElement as HTMLInputElement;
        let value: string | number = active.value;
        if(!/,/.test(value)) value = parseInt(value) * 100;
        active.value = parseToCash(value);
        const total = this.setResult();
        if(total.price <= total.paid) this.elements.buttonHolders[1].element.focus();
        else {
            const input = this.elements.payment.types.find(type => type.children[2].element === active);
            this.elements.payment.types[this.elements.payment.types.indexOf(input) + 1]?.children[2].element.focus();
        }
    }

    selectItem(index: number) {
        if(index === -1) return;

        this.elements.itemsList.children[index]?.element.classList.add("current");
        this.setLastItem(this.itemsData[index]).then();
        this.elements.actionButtons.deleteItem.main.element.disabled = false;
    }

    clearSelection() {
        document.querySelector(".items-list > .current")?.classList.remove("current");
    }

    updateItem(item: ItemData) {
        const priceResult = item.holder.children[0].children[2];
        const itemQuantityNumber = item.holder.children[0].children[0].children[0];
        itemQuantityNumber.element.innerText = item.quantity.toString();
        if(item.quantity > 1) {
            priceResult.element.style.visibility = "visible";
            priceResult.children[1].element.innerText = parseToCash(item.price.sale * item.quantity);
        } else priceResult.element.style.visibility = "hidden";
    }

    deleteItem(item: ItemData) {
        this.elements.itemsList.deleteChild(item.holder);
        this.itemsData.splice(this.itemsData.indexOf(item), 1);

        if(this.itemsData.length == 0) {
            this.elements.actionButtons.deleteItem.main.element.disabled = true;
            this.elements.actionButtons.openPayment.element.disabled = true;
        }
    }

    deleteAllItems() {
        this.elements.itemsList.deleteChildren();
        this.itemsData.splice(0);
        this.elements.actionButtons.deleteItem.main.element.disabled = true;
        this.elements.actionButtons.openPayment.element.disabled = true;
    }

    renderItem(item: ItemData) {
        const itemElement = this.elements.itemsList.createChild("item", "div");
        const itemLeft = itemElement.createChild("left", "div");
        const itemQuantity = itemLeft.createChild("quantity", "div");
        itemQuantity.createChild("number", "span");
        const itemQuantityText = itemQuantity.createChild("text", "span");
        itemQuantityText.element.innerText = "x";

        const itemPrice = itemLeft.createChild("price", "div");
        const itemPriceCurrency = itemPrice.createChild("currency", "span");
        itemPriceCurrency.element.innerText = global.user.settings.currency;
        const itemPriceNumber = itemPrice.createChild("number", "span");
        itemPriceNumber.element.innerText = parseToCash(item.price.sale);

        const priceResult = itemLeft.createChild("result", "div");
        const priceResultText = priceResult.createChild("text", "span");
        priceResultText.element.innerText = `= ${global.user.settings.currency}`;
        priceResult.createChild("number", "span");

        if(item.quantity == 1) priceResult.element.style.visibility = "hidden";

        const itemRight = itemElement.createChild("right", "div");
        const itemName = itemRight.createChild("text", "span");
        itemName.element.innerText = item.name;
        const itemBarcode = itemRight.createChild("barcode", "span");
        itemBarcode.element.innerText = item.barcode;

        itemElement.element.addEventListener("click", () => {
            const current = document.querySelector(".items-list > .item.current");
            if(current == itemElement.element) return;
            current?.classList.remove("current");
            this.selectItem(this.elements.itemsList.children.findIndex(holder => holder == itemElement));
        });

        item.setHTMLElement(itemElement);
        this.updateItem(item);
    }

    appendItem(newItem: ItemData) {
        const found = this.itemsData.find(data => data._id.toHexString() == newItem._id.toHexString());

        if(found) {
            found.quantity += newItem.quantity;
            this.updateItem(found);
        } else {
            this.itemsData.push(newItem);
            this.renderItem(newItem);
        }

        this.elements.actionButtons.openPayment.element.disabled = false;
    }
}