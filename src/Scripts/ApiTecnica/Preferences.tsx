import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { decode, encode } from "base-64";
import moment from "moment";
import qs from "qs";
import { DirectiveData, PreferencesAssist, TypicalRes } from "./types";
import notifee, { AndroidImportance, AndroidVisibility } from "@notifee/react-native";

export default class PreferencesSystem {
    private urlBase: string = '';
    private header_access: { headers: { Authorization: string; } } = { headers: { Authorization: '' } };
    constructor(setUrl: string, setHeaderAccess: string) {
        this.urlBase = setUrl;
        this.header_access.headers.Authorization = setHeaderAccess;
    }
    private isSyncInProgress: boolean = false;
    private isOtherSync: boolean = false;
    async getAssist() {
        try {
            const data = await AsyncStorage.getItem('PreferencesAssist');
            if (data) {
                const process: PreferencesAssist = JSON.parse(decode(data));
                return process.curses;
            }
            return [];
        } catch {
            return [];
        }
    }
    async setAssist(curses: string[]) {
        try {
            const local = await this.getDataLocal();
            const time = moment();
            const value = encode(JSON.stringify({
                idDirective: local.id,
                date: time.format('DD/MM/YYYY'),
                time: time.format('HH:mm:ss'),
                curses: curses
            }));
            if (await AsyncStorage.getItem('PreferencesAssist') !== null) await AsyncStorage.removeItem('PreferencesAssist');
            await AsyncStorage.setItem('PreferencesAssist', value);
            //this.syncData();
            this.SyncInForeground();
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

    private async SyncInForeground() {
        if (this.isSyncInProgress) return this.isOtherSync = true;
        this.isSyncInProgress = true;
        const channelId = await notifee.createChannel({
            id: 'AsyncPreferencesForeground',
            name: 'Sincronización de preferencias en primer plano.',
            vibration: false,
            importance: AndroidImportance.MIN,
            lights: false,
            visibility: AndroidVisibility.PUBLIC
        });
        await notifee.displayNotification({
            id: 'sync',
            title: 'Sincronizando preferencias.',
            android: {
                channelId,
                smallIcon: 'small_icon_notify',
                color: '#FF3232',
                onlyAlertOnce: true,
                progress: {
                    max: 1,
                    current: 0,
                    indeterminate: true
                }
            },
        });
        await this.syncData();
        await this.wait(1000);
        await notifee.cancelNotification('sync');
        this.isSyncInProgress = false;
        this.checkOtherSync();
    }
    private checkOtherSync() {
        if (this.isOtherSync) {
            this.isOtherSync = false;
            this.SyncInForeground();
        }
    }
    private wait(time: number) {
        return new Promise((resolve)=>setTimeout(resolve, time));
    }

    // Online
    private syncLocalData(username: string, password: string) {
        return new Promise((resolve, reject)=>{
            AsyncStorage.getItem('PreferencesAssist').then((value)=>{
                if (value == null) return resolve('');
                const local: PreferencesAssist = JSON.parse(decode(value));
                const postData = {
                    updatePreferencesDirective: true,
                    username,
                    password,
                    date: encode(`${local.date} ${local.time}`),
                    datas: encode(JSON.stringify(local.curses))
                };
                axios.post(`${this.urlBase}/index.php`, qs.stringify(postData), this.header_access).then((value)=>{
                    const result: TypicalRes = value.data;
                    return (result.ok)? resolve(null): reject((result.cause)? result.cause: 'Ocurrio un error inesperado al sincronizar.');
                }).catch(()=>reject('Error al sincronizar las preferencias locales.'));
            }).catch(()=>reject('Error al obtener las preferencias locales.'));
        });
    }
    private downloadData(username: string, password: string) {
        return new Promise((resolve, reject)=>{
            const postData = {
                getPreferencesDirective: true,
                username,
                password
            };
            axios.post(`${this.urlBase}/index.php`, qs.stringify(postData), this.header_access).then(async(value)=>{
                try {
                    const result: TypicalRes = value.data;
                    if (result.ok) {
                        const driveData = JSON.parse(decode(result.datas));
                        await AsyncStorage.setItem('PreferencesAssist', encode(JSON.stringify({
                            idDirective: driveData.idDirective,
                            date: driveData.date,
                            time: driveData.time,
                            curses: JSON.parse(decode(driveData.curses))
                        })));
                        return resolve(null);
                    }
                    reject((result.cause)? result.cause: 'Ocurrio un error inesperado al sincronizar.');
                } catch {
                    reject('Ocurrio un error inesperado al sincronizar.');
                }
            }).catch(()=>reject('Error al sincronizar las preferencias locales.'));
        });
    }
    syncData(): Promise<string> {
        return new Promise((resolve)=>{
            AsyncStorage.getItem('PreferencesAssist').then((local)=>{
                this.getDataLocal().then((data)=>{
                    if (local == null) return this.downloadData(data.username, data.password)
                        .then(()=>resolve('Se sincronizo las preferencias locales.'))
                        .catch((error)=>resolve(error));
                    this.syncLocalData(data.username, data.password)
                        .then(()=>resolve('Se sincronizo las preferencias locales.'))
                        .catch((error)=>{
                            if (error == 'noupdate') return this.downloadData(data.username, data.password)
                                .then(()=>resolve('Se sincronizo las preferencias locales.'))
                                .catch((error)=>resolve(error));
                            resolve(error);
                        });
                }).catch(()=>resolve('none'));
            });
        });
    }
}