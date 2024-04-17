"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLastLoggedUser = exports.createUser = void 0;
const index_1 = require("../index");
async function createUser(user) {
    await index_1.collections.users.insertOne(user);
    return true;
}
exports.createUser = createUser;
async function getLastLoggedUser() {
    return (await index_1.collections.users.findOne({ lastLogged: true }));
}
exports.getLastLoggedUser = getLastLoggedUser;
