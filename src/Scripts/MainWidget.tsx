import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeModules } from "react-native";

const { SharedStorage } = NativeModules;

type AssistData = {
    numAssist: string;
    numNotAssist: string;
    numTotal: string;
};

export default new class MainWidget {
    constructor() {}
    private errorData = JSON.stringify({ numAssist: 'Sin datos', numNotAssist: 'Sin datos', numTotal: 'Sin datos' });
    async init() {
        var getData = await this.getOldData();
        if (getData) return SharedStorage.set(JSON.stringify(getData));
        return SharedStorage.set(this.errorData);
    }
    async getOldData(): Promise<false | AssistData[]> {
        try {
            var data = await AsyncStorage.getItem('AssistData');
            if (data == null) return false;
            var jsonData = JSON.parse(data);
            return jsonData;
        } catch {
            return false;            
        }
    }
    async setNewData(assist: number, notAssist: number, numTotal: number): Promise<boolean> {
        try {
            var process: AssistData = {
                numAssist: assist.toString(),
                numNotAssist: notAssist.toString(),
                numTotal: numTotal.toString()
            };
            await AsyncStorage.setItem('AssistData', JSON.stringify(process));
            SharedStorage.set(JSON.stringify(process));
            return true;
        } catch {
            return false;            
        }
    }
}