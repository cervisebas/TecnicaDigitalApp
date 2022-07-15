import BackgroundFetch from "react-native-background-fetch";
import { Family } from "../Scripts/ApiTecnica";
import MainWidget from "../Scripts/MainWidget";

export default new class BackgroundTask {
    constructor() {}
    init() {
        BackgroundFetch.configure({
            minimumFetchInterval: 15,
            stopOnTerminate: false,
            enableHeadless: true,
            startOnBoot: true,
            // Android options
            forceAlarmManager: true,
            requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY,
            requiresCharging: false,
            requiresDeviceIdle: false,
            requiresBatteryNotLow: false,
            requiresStorageNotLow: false
        }, async (taskId)=>{
            try {
                var data = await Family.getDataAssistStudent();
                var assists: number = 0;
                var notAssists: number = 0;
                data.forEach((v)=>(v.status)? assists += 1: notAssists += 1);
                MainWidget.setNewData(assists, notAssists, data.length);
                // Finish.
                BackgroundFetch.finish(taskId);
            } catch {
                // Finish.
                BackgroundFetch.finish(taskId);
            }
        }, (taskId)=>{
            // Finish.
            BackgroundFetch.finish(taskId);
        });
    }
}