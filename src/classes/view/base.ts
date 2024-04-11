import ViewManager from "./manager";
import ElementHolder, {HTMLElementType} from "../element/holder";
import {camelCaseToKebab, camelCaseToTitle} from "../../shared/convert";
import SubViewManager from "./manager/sub";
import {IKeyboard} from "../handler/keyboard";
import {Input} from "electron";

interface ICSSData {
    filePath: string,
    element: HTMLLinkElement
}

export default class ViewBase implements IKeyboard {
    private readonly name: string;
    private manager: ViewManager;
    private subManager: SubViewManager;
    private readonly mainElement: ElementHolder;
    private readonly css: ICSSData[] = [];
    private readonly keyboardActions: [RegExp, Function][] = [];

    constructor(name: string, cssFilePaths?: string | string[]) {
        this.name = camelCaseToKebab(name);
        this.mainElement = new ElementHolder(
            this.name,
            document.createElement("div")
        );
        if(cssFilePaths) {
            if(!Array.isArray(cssFilePaths)) cssFilePaths = [cssFilePaths];
            this.addCSS(...cssFilePaths);
        }
    }

    getMainElement = () => this.mainElement;

    checkCSS(cssPath: string) {
        return this.css.some(data => data.filePath == cssPath);
    }

    addCSS(...cssPaths: string[]) {
        let result = 0;
        for(const cssPath of cssPaths) {
            if(this.checkCSS(cssPath)) continue;

            const linkElement = document.createElement("link");
            linkElement.rel = "stylesheet";
            linkElement.type = "text/css";
            linkElement.href = cssPath;
            this.css.push({
                filePath: cssPath,
                element: linkElement,
            });
            result++;
        }
        return result;
    }

    createKeyboardAction(regex: RegExp, action: Function) {
        this.keyboardActions.push([regex, action]);
    }

    createChild<Tag extends string>(name: string, tag: Tag, classes?: string[]): ElementHolder<HTMLElementType<Tag>> {
        return this.mainElement.createChild(name, tag, classes);
    }

    createChildren(quantity: number, name: string, tag: string, classes?: string[]): ElementHolder[] {
        return this.mainElement.createChildren(quantity, name, tag);
    }

    load(parent: HTMLElement) {
        if(this.css.length) this.css.forEach(css => document.head.appendChild(css.element));
        if(this.manager.isRootManager()) document.title = camelCaseToTitle(this.name);
        if(this.subManager) this.subManager.load();
        setTimeout(() => parent.appendChild(this.mainElement.element), 10)
    }

    unload() {
        this.mainElement.element.remove();
        if(this.css.length) this.css.forEach(css => css.element.remove());
        if(this.subManager) this.subManager.unload();
    }

    setManager(manager: ViewManager) {
        this.manager = manager;
    }

    setSubManager(manager: SubViewManager) {
        this.subManager = manager;
    }

    keyboard(event: KeyboardEvent) {
        if(this.subManager) this.subManager.keyboard(event);
        const {key} = event;
        for(const action of this.keyboardActions) {
            if(action[0].test(key)) action[1](event);
        }
    }
}