import {IUser} from "../database/models/user";

declare global {
    var user: IUser;
}

export {};