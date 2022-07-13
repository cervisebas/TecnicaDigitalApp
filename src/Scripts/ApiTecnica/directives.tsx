import { ResponseDirectiveData, DirectiveData, DirectivesList, TypicalRes } from "./types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { decode, encode } from "base-64";
import axios from "axios";
import qs from "qs";

export default class DirectiveSystem {
    private urlBase: string = '';
    private header_access: { headers: { Authorization: string; } } = { headers: { Authorization: '' } };
    constructor(setUrl: string, setHeaderAccess: string) {
        this.urlBase = setUrl;
        this.header_access.headers.Authorization = setHeaderAccess;
    }

    public openSession: boolean = false;
    open(username: string, password: string): Promise<boolean> {
        return new Promise((resolve, reject)=>{
            try {
                var postData = { openSessionDirectives: '1', username: encode(username), password: encode(password) };
                axios.post(`${this.urlBase}/index.php`, qs.stringify(postData), this.header_access).then(async(value)=>{
                    var result: ResponseDirectiveData = value.data;
                    if (result.ok) {
                        (result.datas) && await this.saveDataLocal(result.datas);
                        this.openSession = true;
                        resolve(true);
                    }
                    return reject({ ok: false, relogin: true, cause: (result.cause)? result.cause: 'Ocurrio un error inesperado.' });
                }).catch((error)=>reject({ ok: false, cause: 'Error de conexión.', relogin: false, error }));
            } catch (error) {
                reject({ ok: false, cause: 'Ocurrio un error inesperado.', relogin: true, error });
            }
        });
    }
    async saveDataLocal(data: DirectiveData) {
        await AsyncStorage.setItem('DataSession', encode(JSON.stringify(data)));
    }
    getDataLocal(): Promise<DirectiveData> {
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
    verify() {
        return new Promise((resolve, reject)=>{
            this.getDataLocal().then((local)=>
                this.open(decode(local.username), decode(local.password))
                    .then(()=>resolve(true))
                    .catch((e)=>reject({ ok: false, relogin: e.relogin, cause: e.cause }))
            ).catch((error)=>reject({ ok: false, relogin: true, cause: error.cause }));
        });
    }
    async closeSession() {
        await AsyncStorage.multiRemove(['DataSession', 'DataSession'])
    }

    /* ########################################################################### */
    getAll(): Promise<DirectivesList[]> {
        return new Promise((resolve, reject)=>{
            try {
                var Directives = new DirectiveSystem(this.urlBase, this.header_access.headers.Authorization);
                Directives.getDataLocal().then((session)=>{
                    var dataPost = { getAllDirectives: true, username: session.username, password: session.password };
                    axios.post(`${this.urlBase}/index.php`, qs.stringify(dataPost), this.header_access).then((result)=>{
                        var res: TypicalRes = result.data;
                        if (res.ok) resolve(res.datas); else reject({ ok: false, cause: (res.cause)? res.cause: 'Ocurrio un error inesperado.' });
                    }).catch((error)=>reject({ ok: false, cause: 'Error de conexión.', error }));
                }).catch((error)=>reject({ ok: true, cause: error.cause }));
            } catch (error) {
                reject({ ok: false, cause: 'Ocurrio un error inesperado.', error });
            }
        });
    }
    delete(idDirective: string): Promise<boolean> {
        return new Promise((resolve, reject)=>{
            try {
                var Directives = new DirectiveSystem(this.urlBase, this.header_access.headers.Authorization);
                Directives.getDataLocal().then((session)=>{
                    var dataPost = { deleteDirective: true, username: session.username, password: session.password, idDirective };
                    axios.post(`${this.urlBase}/index.php`, qs.stringify(dataPost), this.header_access).then((result)=>{
                        var res: TypicalRes = result.data;
                        if (res.ok) resolve(true); else reject({ ok: false, cause: (res.cause)? res.cause: 'Ocurrio un error inesperado.' });
                    }).catch((error)=>reject({ ok: false, cause: 'Error de conexión.', error }));
                }).catch((error)=>reject({ ok: true, cause: error.cause }));
            } catch (error) {
                reject({ ok: false, cause: 'Ocurrio un error inesperado.', error });
            }
        });
    }
    add(name: string, position: string, dni: string, newUsername: string, newPassword: string, permission: string): Promise<boolean> {
        return new Promise((resolve, reject)=>{
            try {
                var Directives = new DirectiveSystem(this.urlBase, this.header_access.headers.Authorization);
                Directives.getDataLocal().then((session)=>{
                    var dataPost = {
                        addDirective: true,
                        username: session.username,
                        password: session.password,
                        name: encode(name),
                        position: encode(position),
                        dni: encode(dni),
                        newUsername: encode(newUsername),
                        newPassword: encode(newPassword),
                        permission: permission
                    };
                    axios.post(`${this.urlBase}/index.php`, qs.stringify(dataPost), this.header_access).then((result)=>{
                        var res: TypicalRes = result.data;
                        if (res.ok) resolve(true); else reject({ ok: false, cause: (res.cause)? res.cause: 'Ocurrio un error inesperado.' });
                    }).catch((error)=>reject({ ok: false, cause: 'Error de conexión.', error }));
                }).catch((error)=>reject({ ok: true, cause: error.cause }));
            } catch (error) {
                reject({ ok: false, cause: 'Ocurrio un error inesperado.', error });
            }
        });
    }
    edit(idEdit: string, name?: string | undefined, position?: string | undefined, dni?: string | undefined, newUsername?: string | undefined, newPassword?: string | undefined, permission?: string | undefined): Promise<boolean> {
        return new Promise((resolve, reject)=>{
            try {
                var Directives = new DirectiveSystem(this.urlBase, this.header_access.headers.Authorization);
                Directives.getDataLocal().then((session)=>{
                    var dataPost = {
                        editDirective: true,
                        username: session.username,
                        password: session.password,
                        idEdit,
                        name: (name)? encode(name): '',
                        position: (position)? encode(position): '',
                        dni: (dni)? encode(dni): '',
                        newUsername: (newUsername)? encode(newUsername): '',
                        newPassword: (newPassword)? encode(newPassword): '',
                        permission: (permission)? permission: ''
                    };
                    axios.post(`${this.urlBase}/index.php`, qs.stringify(dataPost), this.header_access).then((result)=>{
                        var res: TypicalRes = result.data;
                        if (res.ok) resolve(true); else reject({ ok: false, cause: (res.cause)? res.cause: 'Ocurrio un error inesperado.' });
                    }).catch((error)=>reject({ ok: false, cause: 'Error de conexión.', error }));
                }).catch((error)=>reject({ ok: true, cause: error.cause }));
            } catch (error) {
                reject({ ok: false, cause: 'Ocurrio un error inesperado.', error });
            }
        });
    }
}