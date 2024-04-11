import ViewManager, {ViewManagerElements} from "../../../classes/view/manager";
import ViewBase from "../../../classes/view/base";

export default function createViewManager(elements: ViewManagerElements, views?: ViewBase[], rootManager?: boolean): ViewManager {
    return new ViewManager(elements, views, rootManager);
}