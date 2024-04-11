"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseNCM = exports.cashToInt = exports.parseToCash = exports.camelCaseToKebab = exports.camelCaseToTitle = exports.title = void 0;
function title(str) {
    return str.replace(/(?=^| )[a-zA-Z]/g, (match, first) => (match != first ? " " : "") + match.toUpperCase());
    ;
}
exports.title = title;
function camelCaseToTitle(str) {
    return title(str.replace(/[A-Z]/g, match => " " + match));
}
exports.camelCaseToTitle = camelCaseToTitle;
function camelCaseToKebab(str) {
    return str.replace(/[A-Z]/g, match => "-" + match).toLowerCase();
}
exports.camelCaseToKebab = camelCaseToKebab;
function parseToCash(value) {
    if (typeof value === "number")
        if (isNaN(value))
            value = 0;
    if (typeof value === "string") {
        if (/[,.]/.test(value)) {
            while (value.split(/[,.]/)[1].length < 2) {
                value += "0";
            }
            value = value.replace(/[,.]/, "");
        }
        value = parseInt(value);
    }
    let negative = false;
    if (value < 0) {
        negative = true;
        value = Math.abs(value);
    }
    let cents = (value % 100).toString();
    if (cents.length == 1)
        cents = "0" + cents;
    const integer = Math.floor(value / 100).toString();
    const result = [];
    for (let i = integer.length; i > 0; i -= 3) {
        result.unshift(integer.substring(i - 3, i));
    }
    return `${negative ? "-" : ""}${result.join(".")},${cents}`;
}
exports.parseToCash = parseToCash;
function cashToInt(value) {
    let res;
    if (/[,.]/.test(value)) {
        res = value.split(/[,.]/);
        while (res[1].length < 2) {
            res[1] += "0";
        }
    }
    else
        res = [value, "00"];
    return parseInt(res.join(""));
}
exports.cashToInt = cashToInt;
function parseNCM(value) {
    return value.join(".");
}
exports.parseNCM = parseNCM;
