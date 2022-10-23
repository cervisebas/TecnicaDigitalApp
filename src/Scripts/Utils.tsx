import { decode } from "base-64";
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
export function clearString(str: string) {
    return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trimStart().trimEnd();
}