import { DirectiveData } from "./types";
import { NativeModules } from "react-native";
import { decode, encode } from "base-64";

const { TempSession } = NativeModules;

export function setTempSession(data: DirectiveData): void {
    return TempSession.set(encode(JSON.stringify(data)));
}
export function getTempSession(): Promise<DirectiveData> {
    return new Promise((resolve)=>{
        TempSession.get((data: string)=>{
            const directiveData: DirectiveData = JSON.parse(decode(data));
            return resolve(directiveData);
        });
    });
}
export function isTempSession(): Promise<boolean> {
    return new Promise((resolve)=>{
        TempSession.get((data: string)=>resolve(data !== 'none'));
    });
}