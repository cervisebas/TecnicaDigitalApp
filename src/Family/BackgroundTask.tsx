/*import AsyncStorage from '@react-native-async-storage/async-storage';
import BackgroundService from 'react-native-background-actions';
import { Family } from "../Scripts/ApiTecnica";
import MainWidget from "../Scripts/MainWidget";

const sleep = (time: number)=>new Promise((resolve)=>setTimeout(()=>resolve(true), time));
const veryIntensiveTask = async(taskDataArguments: { delay: number; } | undefined)=>{
    const { delay } = taskDataArguments!;
    await new Promise(async()=>{
        for (let i = 0; BackgroundService.isRunning(); i++) {
            var data = await Family.getDataAssistStudent();
            var assists: number = 0;
            var notAssists: number = 0;
            data.forEach((v)=>(v.status)? assists += 1: notAssists += 1);
            await MainWidget.setNewData(assists, notAssists, data.length);
            await sleep(delay);
        }
    });
};

const options = {
    taskName: 'BackgroundTask',
    taskTitle: 'TecnicaDigital: Widget actualizado',
    taskDesc: 'Proceso en segundo plano ejecutándose...',
    taskIcon: {
        name: 'small_icon_notify',
        type: 'drawable'
    },
    color: '#FF3232',
    linkingURI: 'backgroundTask://open',
    parameters: {
        delay: 1000
    }
};

const startBackgroundTask = async()=>await BackgroundService.start(veryIntensiveTask, options);
const stopBackgroundTask = async()=>await BackgroundService.stop();
const statusBackgroundTask = async()=>{
    try {
        var status = await AsyncStorage.getItem('BackgroundTask');
        return status == '1';
    } catch {
        return false;
    }
};
const switchBackgroundTask = async(value: '1' | '0')=>{
    try {
        await AsyncStorage.setItem('BackgroundTask', value);
        return true;
    } catch {
        return false;
    }
};

export {
    startBackgroundTask,
    stopBackgroundTask,
    switchBackgroundTask,
    statusBackgroundTask
};*/