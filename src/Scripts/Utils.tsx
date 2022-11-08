import { decode } from "base-64";
import moment from "moment";
import stringSimilarity from "string-similarity";

export function orderArray<T>(array: T[], value: string, text: string): T[] {
    type prediction = { index: number; value: number; };
    function functionOrder(a: prediction, b: prediction) {
        return b.value - a.value;
    }
    const formattedQuery = clearString(text);
    const prediction: prediction[] = [];
    array.forEach((element: any, index)=>{
        var name1 = clearString(decode(element[value]));
        const similarity = stringSimilarity.compareTwoStrings(name1, formattedQuery);
        if (name1.indexOf(formattedQuery) !== -1) {
            prediction.push({ index, value: 1 });
            return true;
        }
        if (parseFloat(similarity.toFixed(2)) > 0.3) {
            prediction.push({ index, value: similarity });
            return true;
        }
        return false;
    });
    const orderPrediction = prediction.sort(functionOrder);
    return orderPrediction.map((v)=>array[v.index]);
}
export function orderArrayAlphabeticallyTwo<T>(array: T[], value: string, value2: string): T[] {
    function funct(a: any, b: any) {
        return a[value][value2].localeCompare(b[value][value2]);
    }
    return Object.values(array).sort(funct);
}
export function orderArraySingle<T>(array: T[], text: string, isEncode?: boolean): T[] {
    type prediction = { index: number; value: number; };
    function functionOrder(a: prediction, b: prediction) {
        return b.value - a.value;
    }
    const formattedQuery = clearString(text);
    const prediction: prediction[] = [];
    array.forEach((element: any, index)=>{
        var name1 = clearString((isEncode)? decode(element): element);
        const similarity = stringSimilarity.compareTwoStrings(name1, formattedQuery);
        if (name1.indexOf(formattedQuery) !== -1) {
            prediction.push({ index, value: 1 });
            return true;
        }
        if (parseFloat(similarity.toFixed(2)) > 0.3) {
            prediction.push({ index, value: similarity });
            return true;
        }
        return false;
    });
    const orderPrediction = prediction.sort(functionOrder);
    return orderPrediction.map((v)=>array[v.index]);
}
export function clearString(str: string) {
    return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trimStart().trimEnd();
}
export function removeItem<T>(arr: T[], index: number): T[] {
    if (index > -1) arr.splice(index, 1);
    return arr;
}
export function capitalizeString(str: string, lower?: boolean) {
    return ((lower)? str.toLowerCase(): str).replace(/(?:^|\s|["'([{])+\S/g, (match)=>match.toUpperCase());
}
export function capitalizeArrayString(arr: string[]): string[] {
    return arr.map((v)=>capitalizeString(v));
}
export function isDateBetween(dateFrom: string, dateTo: string, dateCheck: string) {
    const from = moment(dateFrom, 'DD/MM').valueOf();
    const to = moment(dateTo, 'DD/MM').valueOf();
    const check = moment(dateCheck, 'DD/MM').valueOf();
    return check >= from && check <= to;
}
export function waitTo(time: number): Promise<void> {
    return new Promise((resolve)=>setTimeout(resolve, time));
}
export function getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}