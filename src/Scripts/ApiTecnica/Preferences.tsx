import AsyncStorage from "@react-native-async-storage/async-storage";
import { decode, encode } from "base-64";
import moment from "moment";
import { DirectiveData, PreferencesAssist } from "./types";

export default class PreferencesSystem {
    constructor() {}
    async getAssist() {
        try {
            var data = await AsyncStorage.getItem('PreferencesAssist');
            if (data) return (JSON.parse(decode(data)) as PreferencesAssist).curses;
            return [];
        } catch {
            return [];
        }
    }
    async setAssist(curses: string[]) {
        try {
            const local = await this.getDataLocal();
            const time = moment();
            await AsyncStorage.setItem('PreferencesAssist', encode(JSON.stringify({
                idDirective: local.id,
                date: time.format('DD/MM/YYYY'),
                time: time.format('HH:mm'),
                curses: curses
            })));
        } catch {
            throw "Ocurrió un error inesperado.";
        }
    }
    isIntoSyncHours() {
        var SyncHours = [
            { hour: 7, minMinutes: 0, maxMinutes: 45, result: '7:15' },
            { hour: 8, minMinutes: 25, maxMinutes: 50, result: '8:40' },
            { hour: 9, minMinutes: 25, maxMinutes: 59, result: '9:50' },
            { hour: 10, minMinutes: 0, maxMinutes: 1, result: '9:50' },
            { hour: 11, minMinutes: 0, maxMinutes: 30, result: '11:00' },
            { hour: 13, minMinutes: 0, maxMinutes: 40, result: '13:15' },
            { hour: 14, minMinutes: 0, maxMinutes: 20, result: '14:25' },
            { hour: 15, minMinutes: 10, maxMinutes: 50, result: '15:35' },
            { hour: 16, minMinutes: 25, maxMinutes: 59, result: '16:45' },
            { hour: 17, minMinutes: 0, maxMinutes: 10, result: '16:45' }
        ];
        const actualDate = moment();
        const now: { hour: number, minutes: number } = { hour: parseInt(actualDate.format('HH')), minutes: parseInt(actualDate.format('mm')) };
        const find = SyncHours.find((value)=>{
            if (value.hour == now.hour) {
                if (now.minutes >= value.minMinutes && now.minutes <= value.maxMinutes) return value;
            }
        });
        return !!find;
    }
    private getDataLocal(): Promise<DirectiveData> {
        return new Promise(async(resolve, reject)=>{
            AsyncStorage.getItem('DataSession').then((value)=>{
                try {
                    if (!value) return reject({ ok: false, cause: 'No se encontraron datos de inicio de sesión. '});
                    resolve(JSON.parse(decode(value)));
                } catch {
                    reject({ ok: false, cause: 'Ocurrió un error inesperado.' });
                }
            }).catch(()=>reject({ ok: false, cause: 'Error al acceder a los datos almacenados' }));
        });
    }
}