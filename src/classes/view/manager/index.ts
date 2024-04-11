import ViewBase from "../base";
import {IKeyboard} from "../../handler/keyboard";
import {Input} from "electron";

export interface ViewManagerElements {
    parent: HTMLElement,
    tab: {
        elements: HTMLElement[],
        selector: string,
    },
}

export default class ViewManager implements IKeyboard{
    private readonly rootManager: boolean = false;
    private views: ViewBase[] = [];
    private elements: ViewManagerElements;
    private current: number;
    constructor(elements: ViewManagerElements, views?: ViewBase[], rootManager?: boolean) {
        this.elements = elements;
        for(const button of this.elements.tab.elements) {
            button.addEventListener("click", () => {
                this.setView(this.views[this.elements.tab.elements.indexOf(button)]);
                document.querySelector(`${elements.tab.selector}.current`)?.classList.remove("current");
                button.classList.add("current");
            })
        }
        if(rootManager) this.rootManager = rootManager;
        for(const view of views) this.subscribe(view);
    }

    clearCurrent = (): void => this.current = undefined;
    getCurrent = (): number => this.current;
    getViews = (): ViewBase[] => this.views;
    isRootManager = (): boolean => this.rootManager;

    subscribe(view: ViewBase): boolean {
        this.views.push(view);
        view.setManager(this);
        return true;
    }

    unsubscribe(view: ViewBase): boolean {
        if(!this.views.includes(view) ||
            this.views.indexOf(view) == this.current) return false;
        this.views.splice(this.views.indexOf(view), 1);
        return true;
    }

    setView(view: ViewBase) {
        if(!this.views.includes(view)) return false;
        if(this.views[this.current] == view) return false;
        this.views[this.current]?.unload();
        this.current = this.views.indexOf(view);
        this.views[this.current].load(this.elements.parent);
        return true;
    }

    keyboard(event: KeyboardEvent) {
        this.views[this.current].keyboard(event);
    }
}