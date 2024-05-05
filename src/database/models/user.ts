import {ObjectId} from "mongodb";
import {getLastLoggedUser} from "../services/user";

export interface ISettings {
    currency: string,
    paymentTypes: string[],
}

export enum UserFields {
    _id = "_id",
    name = "name",
    settings = "settings",
    lastLogged = "lastLogged",
}

type UserKeys = keyof typeof UserFields;
type UserKeyFields = {[key in UserKeys]?: any};

export interface IUser extends UserKeyFields {
    _id?: ObjectId,
    name?: string,
    settings?: ISettings,
    lastLogged?: boolean,
}

export default class User implements IUser {
    _id?: ObjectId;
    name: string;
    settings: ISettings;
    lastLogged: boolean = false;
    constructor(name: string) {
        this.name = name;
        this.settings = {
            currency: "R$",
            paymentTypes: ["Dinheiro", "Cartão", "PIX"] as const,
        };
        getLastLoggedUser().then(lastUser => {
            if(lastUser === null) {
                this.lastLogged = true;
                user = this;
            }
        });
    }
}