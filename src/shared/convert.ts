import {TNCM} from "../database/models/item";

export function title(str: string): string {
    return str.replace(/(?=^| )[a-zA-Z]/g, (match, first) => (match != first ? " " : "") + match.toUpperCase());;
}

export function camelCaseToTitle(str: string): string {
    return title(str.replace(/[A-Z]/g, match => " " + match));
}

export function camelCaseToKebab(str: string): string {
    return str.replace(/[A-Z]/g, match => "-" + match).toLowerCase();
}

export function parseToCash(value: number | string) {
    if(typeof value === "number") if(isNaN(value)) value = 0;
    if(typeof value === "string") {
        if(/[,.]/.test(value)) {
            while(value.split(/[,.]/)[1].length < 2) {
                value += "0";
            }
            value = value.replace(/[,.]/, "");
        }
        value = parseInt(value);
    }
    let negative: boolean = false;
    if(value < 0) {
        negative = true;
        value = Math.abs(value);
    }
    let cents = (value % 100).toString();
    if(cents.length == 1) cents = "0" + cents;
    const integer = Math.floor(value / 100).toString();
    const result: string[] = [];
    for(let i = integer.length; i > 0; i -= 3) {
        result.unshift(integer.substring(i - 3, i));
    }
    return `${negative ? "-" : ""}${result.join(".")},${cents}`;
}

export function cashToInt(value: string) {
    let res: string[];
    if(/[,.]/.test(value)) {
        res = value.split(/[,.]/);
        while(res[1].length < 2) {
            res[1] += "0"
        }
    } else res = [value, "00"];

    return parseInt(res.join(""));
}

export function parseNCM(value: TNCM) {
    return value.join(".");
}