"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_1 = require("../services/user");
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
