import { decode, encode } from "base-64";
import axios from "axios";
import qs from "qs";
import { TypicalRes } from "./types";
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
            axios.post(this.urlBase, dataPost, this.header_access)
                .then(async(result)=>{
                    var res: TypicalRes = result.data;
                    if (res.ok) {
                        await AsyncStorage.setItem('FamilySession', encode(JSON.stringify({
                            id: res.datas,
                            dni: encode(dni)
                        })));
                        return resolve(true);
                    }
                    return reject({ ok: false, cause: (res.cause)? res.cause: 'Ocurrio un error inesperado.' });
                }).catch(()=>reject({ ok: false, cause: 'Error de conexión.' }));
        });
    }
    getDataLocal(): Promise<{ id: string; dni: string; }> {
        return new Promise((resolve, reject)=>{
            AsyncStorage.getItem('FamilySession').then((value)=>{
                try {
                    if (!value) return reject('No se encontraron datos de inicio de sesión.');
                    resolve(JSON.parse(decode(value)));
                } catch {
                    reject('Ocurrió un error inesperado.');
                }
            }).catch(()=>reject('Error al acceder a los datos almacenados'));
        });
    }
    verify(): Promise<boolean> {
        return new Promise((resolve, reject)=>{
            this.getDataLocal().then((local)=>
                this.open(decode(local.dni))
                    .then(()=>resolve(true))
                    .catch((e)=>reject({ ok: false, relogin: e.relogin, cause: e.cause }))
            ).catch((error)=>reject({ ok: false, relogin: true, cause: error }));
        });
    }
}