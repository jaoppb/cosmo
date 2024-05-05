import createViewManager from "./factories/view/manager";
import createAllViews from "./factories/view/all";
import {ViewManagerElements} from "./classes/view/manager";
import KeyboardHandler from "./classes/handler/keyboard";
import connectToDatabase from "./database";
import {createUser, getLastLoggedUser} from "./database/services/user";
import User from "./database/models/user";

const keyboardHandler = new KeyboardHandler();
window.addEventListener("keydown", event => keyboardHandler.trigger(event));
window.addEventListener("keyup", event => keyboardHandler.trigger(event));

const preload = async (callback: () => void) => {
    try {
        await connectToDatabase();
    } catch (err) {
        console.log(err);
    } finally {
        global.user = await getLastLoggedUser();
        if(global.user === null) await createUser(new User("default"));
        callback();
    }
}

const load = () => {
    const elements: ViewManagerElements = {
        parent: document.querySelector("main"),
        tab: {
            elements: Array.from(document.querySelectorAll<HTMLElement>("nav .view")),
            selector: "nav .view"
        },
    };
    const views = createAllViews();
    const viewManager = createViewManager(elements, views, true);
    viewManager.setView(views[0]);
    keyboardHandler.subscribe(viewManager);
    console.log("App loaded successfully")
}

preload(() => window.onload = load).then();