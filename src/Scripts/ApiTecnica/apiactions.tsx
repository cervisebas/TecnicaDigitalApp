import AsyncStorage from "@react-native-async-storage/async-storage";
import { getTempSession, isTempSession } from "./tempsession";

export default class ApiActions {
    constructor() {}
    verifySession(): Promise<number> {
        return new Promise(async(resolve, reject)=>{
            const isTemp = await isTempSession();
            if (isTemp) return resolve(0);
            AsyncStorage.multiGet(['DataSession', 'FamilySession']).then((values)=>{
                if (values[0][1] !== null) return resolve(0);
                if (values[1][1] !== null) return resolve(1);
                reject();
            }).catch(reject);
        });
    }
}