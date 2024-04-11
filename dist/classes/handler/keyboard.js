"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class KeyboardHandler {
    targets = [];
    constructor(targets) {
        if (targets !== undefined) {
            if (!Array.isArray(targets))
                targets = [targets];
            for (const target of targets) {
                this.subscribe(target);
            }
        }
    }
    subscribe(targets) {
        if (!Array.isArray(targets))
            targets = [targets];
        this.targets.push(...targets);
        return true;
    }
    unsubscribe(target) {
        if (!this.targets.includes(target))
            return false;
        this.targets.splice(this.targets.indexOf(target));
        return true;
    }
    trigger(event) {
        for (const target of this.targets) {
            target.keyboard(event);
        }
    }
}
exports.default = KeyboardHandler;
