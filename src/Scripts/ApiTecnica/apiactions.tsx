import AsyncStorage from "@react-native-async-storage/async-storage";

export default class ApiActions {
    constructor() {}
    verifySession(): Promise<number> {
        return new Promise((resolve, reject)=>
            AsyncStorage.multiGet(['DataSession', 'FamilySession']).then((values)=>{
                if (values[0][1] !== null) return resolve(0);
                if (values[1][1] !== null) return resolve(1);
                reject();
            }).catch(reject)
        );
    }
}