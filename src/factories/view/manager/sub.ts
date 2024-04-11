import SubViewManager from "../../../classes/view/manager/sub";
import ViewBase from "../../../classes/view/base";
import {ViewManagerElements} from "../../../classes/view/manager";

const createSubViewManager = (elements: ViewManagerElements, views: ViewBase[]) => new SubViewManager(elements, views);

export default createSubViewManager;