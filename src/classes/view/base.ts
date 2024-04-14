import ViewManager from "./manager";
import ElementHolder, {HTMLElementType} from "../element/holder";
import {camelCaseToKebab, camelCaseToTitle} from "../../shared/convert";
import SubViewManager from "./manager/sub";
import {IKeyboard} from "../handler/keyboard";

interface ICSSData {
    filePath: string,
    element: HTMLLinkElement,
}

interface ICSSInput {
    filePath: string,
    priority?: number,
}

export class CSSInput implements ICSSInput {
    filePath: string;
    priority: number = 0;
    constructor(filePath: string, priority?: number) {
        this.filePath = filePath;
        if(priority) this.priority = priority;
    }
}

export default class ViewBase implements IKeyboard {
    private readonly name: string;
    private manager: ViewManager;
    private subManager: SubViewManager;
    private readonly mainElement: ElementHolder;
    private readonly css: Record<number, ICSSData[]> = {};
    private readonly keyboardActions: [RegExp, Function][] = [];

    constructor(name: string, cssFilePaths?: CSSInput | string | (CSSInput | string)[]) {
        this.name = camelCaseToKebab(name);
        this.mainElement = new ElementHolder(
            this.name,
            document.createElement("div")
        );
        if(cssFilePaths) this.addCSS(cssFilePaths);
    }

    getMainElement = () => this.mainElement;

    checkCSS(cssPath: string) {
        return Object.values(this.css).some(dataArray =>
            dataArray.some(data => data.filePath == cssPath)
        );
    }

    addCSS(cssInputs: CSSInput | string | (CSSInput | string)[]) {
        if(!Array.isArray(cssInputs)) cssInputs = [cssInputs];

        let result = 0;
        for(const cssInput of cssInputs.map(cssFilePath => {
            if(cssFilePath instanceof CSSInput) return cssFilePath;
            else return new CSSInput(cssFilePath);
        })) {
            if(this.checkCSS(cssInput.filePath)) continue;

            const linkElement = document.createElement("link");
            linkElement.rel = "stylesheet";
            linkElement.type = "text/css";
            linkElement.href = cssInput.filePath;
            if(this.css[cssInput.priority ?? 0] == undefined) this.css[cssInput.priority ?? 0] = [];
            this.css[cssInput.priority ?? 0].push({
                filePath: cssInput.filePath,
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
        if(Object.values(this.css).length > 0) {
            const keys = Object.keys(this.css).map(key => parseInt(key)).toSorted();
            keys.forEach(key =>
                this.css[key].forEach(css => document.head.appendChild(css.element))
            );
        }
        if(this.manager.isRootManager()) document.title = camelCaseToTitle(this.name);
        if(this.subManager) this.subManager.load();
        setTimeout(() => parent.appendChild(this.mainElement.element), 10)
    }

    unload() {
        this.mainElement.element.remove();
        if(Object.values(this.css).length > 0) {
            Object.values(this.css).forEach(cssArray =>
                cssArray.forEach(css => css.element.remove())
            );
        }
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