export interface IKeyboard {
    keyboard(event: KeyboardEvent): void
}

export default class KeyboardHandler {
    private targets: IKeyboard[] = [];
    constructor(targets?: IKeyboard[] | IKeyboard | undefined) {
        if(targets !== undefined) {
            if(!Array.isArray(targets)) targets = [targets];

            for(const target of targets) {
                this.subscribe(target);
            }
        }
    }

    subscribe(targets: IKeyboard[] | IKeyboard) {
        if(!Array.isArray(targets)) targets = [targets];
        this.targets.push(...targets);
        return true;
    }

    unsubscribe(target: IKeyboard) {
        if(!this.targets.includes(target)) return false;
        this.targets.splice(this.targets.indexOf(target));
        return true;
    }

    trigger(event: KeyboardEvent) {
        for(const target of this.targets) {
            target.keyboard(event);
        }
    }
}