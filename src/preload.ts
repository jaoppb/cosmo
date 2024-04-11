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
(async () => {
    await connectToDatabase();
    global.user = await getLastLoggedUser();
    if(global.user === null) {
        await createUser(new User("default"));
    }
})();

window.onload = () => {
    const elements: ViewManagerElements = {
        parent: document.querySelector("main"),
        tab: {
            elements: Array.from(document.querySelectorAll<HTMLElement>("nav .view")),
            selector: "nav .view"
        },
    };
    const views = createAllViews();
    const viewManager = createViewManager(elements, views, true);
    viewManager.setView(views[1]);
    keyboardHandler.subscribe(viewManager);
}
