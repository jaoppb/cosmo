import {camelCaseToKebab} from "../../shared/convert";

export type HTMLElementType<Tag extends string> =
    Tag extends keyof HTMLElementTagNameMap
        ? HTMLElementTagNameMap[Tag]
        : HTMLElement;

export default class ElementHolder<Type extends HTMLElement = HTMLElement> {
    readonly name: string;
    readonly element: Type;
    readonly children: ElementHolder[] = [];
    constructor(name: string, element: Type, classes?: string[]) {
        this.name = name;
        this.element = element;
        this.element.classList.add(camelCaseToKebab(name));
        if(classes) this.element.classList.add(...classes)
    }

    createChild<Tag extends string>(name: string, tag: Tag, classes?: string[]): ElementHolder<HTMLElementType<Tag>> {
        const holder = new ElementHolder<HTMLElementType<Tag>>(name, document.createElement(tag) as HTMLElementType<Tag>, classes);
        this.element.appendChild(holder.element);
        this.children.push(holder);
        return holder;
    }

    createChildren<Tag extends string>(quantity: number, name: string, tag: Tag, classes?: string[]): ElementHolder<HTMLElementType<Tag>>[] {
        const holders: ElementHolder<HTMLElementType<Tag>>[] = [];
        for(let i = 0; i < quantity; i++) {
            holders.push(
                this.createChild(name, tag, classes)
            );
        }
        return holders;
    }

    deleteChild(child: ElementHolder) {
        if(!this.children.includes(child)) return;

        child.element.remove();
        this.children.splice(this.children.indexOf(child), 1);
    }

    deleteChildren() {
        for(const child of this.children)
            child.element.remove();
        this.children.splice(0);
    }
}