import ViewBase from "../../classes/view/base";
import createViewHome from "./home";
import createViewManagement from "./management";
import createViewPointOfSale from "./pointOfSale";
import createViewSettings from "./settings";

const createAllViews = (): ViewBase[] => {
    const views: ViewBase[] = [];
    views.push(
        createViewHome(),
        createViewManagement(),
        createViewPointOfSale(),
        createViewSettings()
    );
    return views;
}

export default createAllViews;