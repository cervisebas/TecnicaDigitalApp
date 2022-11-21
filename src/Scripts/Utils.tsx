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
export function orderArrayBySelect<T>(array: T[], value: string | string[], text: string): Promise<T[]> {
    return new Promise((resolve)=>{
        function getValue(this: any, el: any, selector: string): any {
            this.element = el;
            return eval(`this.element.${selector}`);
        }
        type prediction = { index: number; value: number; };
        function functionOrder(a: prediction, b: prediction) {
            return b.value - a.value;
        }
        const formattedQuery = clearString(text);
        let prediction: prediction[] = [];
        if (Array.isArray(value)) {
            value.forEach((val)=>{
                array.forEach((element: any, index)=>{
                    var name1 = clearString(decode(getValue(element, val)));
                    const similarity = stringSimilarity.compareTwoStrings(name1, formattedQuery);
                    if (name1.indexOf(formattedQuery) !== -1) {
                        const push = { index, value: 1 };
                        const find = prediction.findIndex((v)=>v == push);
                        if (find == -1) prediction.push(push); else if (prediction[find].value < push.value) prediction[find].value = push.value;
                        return true;
                    }
                    if (parseFloat(similarity.toFixed(2)) > 0.3) {
                        const push = { index, value: similarity };
                        const find = prediction.findIndex((v)=>v == push);
                        if (find == -1) prediction.push(push); else if (prediction[find].value < push.value) prediction[find].value = push.value;
                        return true;
                    }
                    return false;
                });
            });
            prediction = [...new Set(prediction)];
            const orderPrediction = prediction.sort(functionOrder);
            return resolve(orderPrediction.map((v)=>array[v.index]));
        }
        array.forEach((element: any, index)=>{
            var name1 = clearString(decode(getValue(element, value)));
            const similarity = stringSimilarity.compareTwoStrings(name1, formattedQuery);
            if (name1.indexOf(formattedQuery) !== -1) {
                const push = { index, value: 1 };
                prediction.push(push);
                return true;
            }
            if (parseFloat(similarity.toFixed(2)) > 0.3) {
                const push = { index, value: similarity };
                prediction.push(push);
                return true;
            }
            return false;
        });
        const orderPrediction = prediction.sort(functionOrder);
        resolve(orderPrediction.map((v)=>array[v.index]));
    });
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
export function getRandomIntInclusive(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}
export function daysInMonth(month: number, year: number) {
    return new Date(year, month, 0).getDate();
}