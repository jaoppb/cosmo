"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserFields = void 0;
const user_1 = require("../services/user");
var UserFields;
(function (UserFields) {
    UserFields["_id"] = "_id";
    UserFields["name"] = "name";
    UserFields["settings"] = "settings";
    UserFields["lastLogged"] = "lastLogged";
})(UserFields || (exports.UserFields = UserFields = {}));
class User {
    _id;
    name;
    settings;
    lastLogged = false;
    constructor(name) {
        this.name = name;
        this.settings = {
            currency: "R$",
            paymentTypes: ["Dinheiro", "Cartão", "PIX"],
        };
        (0, user_1.getLastLoggedUser)().then(lastUser => {
            if (lastUser === null) {
                this.lastLogged = true;
                user = this;
            }
        });
    }
}
exports.default = User;
