import { ResponseDirectiveData, DirectiveData, DirectivesList, TypicalRes, ApiHeader } from "./types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { decode, encode } from "base-64";
import axios from "axios";
import qs from "qs";
import { getTempSession, isTempSession, setTempSession } from "./tempsession";

export default class DirectiveSystem {
    private urlBase: string = '';
    private header_access: any;
    private header_access2: any;
    constructor(setUrl: string, setHeaderAccess: ApiHeader) {
        this.urlBase = setUrl;
        this.header_access = setHeaderAccess;
        this.header_access2 = {
            ...setHeaderAccess,
            headers: {
                ...setHeaderAccess.headers,
                'Content-Type': 'multipart/form-data'
            }
        };
    }

    public openSession: boolean = false;
    open(username: string, password: string, temp?: boolean): Promise<boolean> {
        return new Promise((resolve, reject)=>{
            try {
                const postData = { openSessionDirectives: '1', username: encode(username), password: encode(password) };
                axios.post(`${this.urlBase}/index.php`, qs.stringify(postData), this.header_access).then(async(value)=>{
                    var result: ResponseDirectiveData = value.data;
                    if (result.ok) {
                        if (result.datas) {
                            if (temp)
                                setTempSession(result.datas);
                            else
                                await this.saveDataLocal(result.datas);
                        }
                        this.openSession = true;
                        return resolve(true);
                    }
                    if (result.datas) return reject({ ok: false, cause: result.cause, relogin: false, error: result.datas as any });
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
            const isTemp = await isTempSession();
            if (isTemp) return resolve(await getTempSession());
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
        return new Promise(async(resolve, reject)=>{
            const isTemp = await isTempSession();
            this.getDataLocal().then((local)=>
                this.open(decode(local.username), decode(local.password), isTemp)
                    .then(()=>resolve(true))
                    .catch((e)=>reject({ ok: false, relogin: e.relogin, cause: e.cause }))
            ).catch((error)=>reject({ ok: false, relogin: true, cause: error.cause }));
        });
    }
    async closeSession() {
        await AsyncStorage.multiRemove(['DataSession', 'PreferencesAssist']);
    }

    /* ########################################################################### */
    getAll(): Promise<DirectivesList[]> {
        return new Promise((resolve, reject)=>{
            try {
                var Directives = new DirectiveSystem(this.urlBase, this.header_access);
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
                var Directives = new DirectiveSystem(this.urlBase, this.header_access);
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
                var Directives = new DirectiveSystem(this.urlBase, this.header_access);
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
                var Directives = new DirectiveSystem(this.urlBase, this.header_access);
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
    editImage(idEdit: string, image?: { uri: string; type: string; name: string; }, remove?: boolean): Promise<void> {
        return new Promise((resolve, reject)=>{
            try {
                var Directives = new DirectiveSystem(this.urlBase, this.header_access);
                Directives.getDataLocal().then((session)=>{
                    var form = new FormData();
                    form.append('editImageDirective', '1');
                    form.append('username', session.username);
                    form.append('password', session.password);
                    form.append('idEdit', idEdit);
                    (image)&&form.append('image', image);
                    (remove)&&form.append('removeImage', '1');
                    axios.post(`${this.urlBase}/index.php`, form, this.header_access2).then((result)=>{
                        const res: TypicalRes = result.data;
                        console.log(result.data);
                        if (res.ok) resolve(); else reject({ ok: false, cause: (res.cause)? res.cause: 'Ocurrio un error inesperado.' });
                    }).catch((error)=>reject({ ok: false, cause: 'Error de conexión.', error }));
                }).catch((error)=>reject({ ok: true, cause: error.cause }));
            } catch (error) {
                reject({ ok: false, cause: 'Ocurrio un error inesperado.', error });
            }
        });
    }
}