import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeModules } from "react-native";

const { SharedStorage } = NativeModules;

type AssistData = {
    numAssist: string;
    numNotAssist: string;
    numTotal: string;
};

export default new class MainWidget {
    private errorData = JSON.stringify({
        numAssist: 'Sin datos',
        numNotAssist: 'Sin datos',
        numTotal: 'Sin datos'
    });
    async init() {
        try {
            const getData = await this.getOldData();
            if (getData) return SharedStorage.set(JSON.stringify(getData));
            return SharedStorage.set(this.errorData);
        } catch {
            return null;
        }
    }
    async getOldData(): Promise<false | AssistData[]> {
        try {
            const data = await AsyncStorage.getItem('AssistData');
            if (data == null) return false;
            const jsonData = JSON.parse(data);
            return jsonData;
        } catch {
            return false;            
        }
    }
    async setNewData(assist: number, notAssist: number, numTotal: number): Promise<boolean> {
        try {
            const process: AssistData = {
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