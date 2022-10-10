import { decode, encode } from "base-64";
import axios from "axios";
import qs from "qs";
import { DataSchedule, FamilyDataAssist, TypicalRes } from "./types";
import { StudentsData } from "./types";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default class FamilySystem {
    private urlBase: string = '';
    private header_access: { headers: { Authorization: string; } } = { headers: { Authorization: '' } };
    constructor(setUrl: string, setHeaderAccess: string) {
        this.urlBase = setUrl;
        this.header_access.headers.Authorization = setHeaderAccess;
    }
    open(dni: string) : Promise<boolean> {
        return new Promise((resolve, reject)=>{
            var dataPost = qs.stringify({ family_login: true, dni: encode(dni) });
            axios.post(`${this.urlBase}/index.php`, dataPost, this.header_access)
                .then(async(result)=>{
                    try {
                        var res: TypicalRes = result.data;
                        if (res.ok) {
                            await AsyncStorage.setItem('FamilySession', encode(JSON.stringify({
                                id: res.datas,
                                dni: encode(dni)
                            })));
                            return resolve(true);
                        }
                        return reject({ ok: false, cause: (res.cause)? res.cause: 'Ocurrio un error inesperado.' });
                    } catch {
                        reject({ ok: false, cause: 'Ocurrio un error inesperado.' });
                    }
                }).catch(()=>reject({ ok: false, cause: 'Error de conexión.' }));
        });
    }
    getDataLocal(): Promise<{ id: string; dni: string; }> {
        return new Promise((resolve, reject)=>{
            AsyncStorage.getItem('FamilySession').then((value)=>{
                try {
                    if (!value) return reject({ ok: false, cause: 'No se encontraron datos de inicio de sesión.' });
                    resolve(JSON.parse(decode(value)));
                } catch {
                    reject({ ok: false, cause: 'Ocurrió un error inesperado.' });
                }
            }).catch(()=>reject({ ok: false, cause: 'Error al acceder a los datos almacenados' }));
        });
    }
    verify(): Promise<boolean> {
        return new Promise((resolve, reject)=>{
            this.getDataLocal().then((local)=>
                this.open(decode(local.dni))
                    .then(()=>resolve(true))
                    .catch((e)=>reject({ ok: false, relogin: e.relogin, cause: e.cause }))
            ).catch((error)=>reject({ ok: false, relogin: true, cause: error.cause }));
        });
    }

    getDataStudent(): Promise<StudentsData> {
        return new Promise((resolve, reject)=>{
            this.getDataLocal().then((local)=>{
                var dataPost = qs.stringify({ family_getData: true, dni: local.dni });
                axios.post(`${this.urlBase}/index.php`, dataPost, this.header_access)
                    .then(async(result)=>{
                        try {
                            var res: TypicalRes = result.data;
                            if (res.ok) resolve(res.datas);
                            return reject({ ok: false, cause: (res.cause)? res.cause: 'Ocurrio un error inesperado.' });
                        } catch {
                            reject({ ok: false, cause: 'Ocurrio un error inesperado.' });                            
                        }
                    }).catch((error)=>reject({ ok: false, cause: 'Error de conexión.', error }));
            }).catch((e)=>reject(e));
        });
    }
    getSubscribeData(): Promise<boolean> {
        return new Promise((resolve, reject)=>{
            AsyncStorage.getItem('FamilyOptionSuscribe').then((value)=>{
                try {
                    if (!value) return resolve(false);
                    resolve(value == '1');
                } catch {
                    reject({ ok: false, cause: 'Ocurrió un error inesperado.' });
                }
            }).catch(()=>reject({ ok: false, cause: 'Error al acceder a los datos almacenados' }));
        });
    }
    getDataAssistStudent(): Promise<FamilyDataAssist[]> {
        return new Promise((resolve, reject)=>{
            this.getDataLocal().then((local)=>{
                var dataPost = qs.stringify({ family_getDataAssist: true, dni: local.dni });
                axios.post(`${this.urlBase}/index.php`, dataPost, this.header_access)
                    .then(async(result)=>{
                        try {
                            var res: TypicalRes = result.data;
                            if (res.ok) resolve(res.datas);
                            return reject({ ok: false, cause: (res.cause)? res.cause: 'Ocurrio un error inesperado.' });
                        } catch {
                            reject({ ok: false, cause: 'Ocurrio un error inesperado.' });                            
                        }
                    }).catch((error)=>reject({ ok: false, cause: 'Error de conexión.', error }));
            }).catch((e)=>reject(e));
        });
    }
    getSchedule(curse: string): Promise<DataSchedule> {
        return new Promise((resolve, reject)=>{
            this.getDataLocal().then((local)=>{
                var dataPost = qs.stringify({ family_getSchedule: true, curse, dni: local.dni });
                axios.post(`${this.urlBase}/index.php`, dataPost, this.header_access)
                    .then(async(result)=>{
                        try {
                            var res: TypicalRes = result.data;
                            if (res.ok) resolve(res.datas);
                            return reject({ ok: false, cause: (res.cause)? res.cause: 'Ocurrio un error inesperado.' });
                        } catch {
                            reject({ ok: false, cause: 'Ocurrio un error inesperado.' });                            
                        }
                    }).catch((error)=>reject({ ok: false, cause: 'Error de conexión.', error }));
            }).catch((e)=>reject(e));
        });
    }
}