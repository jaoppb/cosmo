import {collections} from "../index";
import User, {IUser} from "../models/user";

export async function createUser(user: IUser) {
    await collections.users.insertOne(user);

    return true;
}

export async function getLastLoggedUser() {
    return (await collections.users.findOne({lastLogged: true})) as User;
}