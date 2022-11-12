import axios from "axios";
import { encode } from "base-64";
import QueryString from "qs";
import DirectiveSystem from "./directives";
import { ApiHeader, DataSchedule, TypicalRes } from "./types";

type CreateSchedule = {
    day: string;
    hour: string;
    group: string;
    matter: string;
};

export default class ScheduleSystem {
    private urlBase: string = '';
    private header_access: any;
    constructor(setUrl: string, setHeaderAccess: ApiHeader) {
        this.urlBase = setUrl;
        this.header_access = setHeaderAccess;
    }
    create(curse: string, data: CreateSchedule[]): Promise<boolean> {
        return new Promise((resolve, reject)=>{
            const Directives = new DirectiveSystem(this.urlBase, this.header_access);
            Directives.getDataLocal().then((value)=>{
                const postData = { addSchedule: true, username: value.username, password: value.password, curse: encode(curse), data: encode(JSON.stringify(data)) };
                axios.post(`${this.urlBase}/index.php`, QueryString.stringify(postData), this.header_access).then((result)=>{
                    var res: TypicalRes = result.data;
                    if (res.ok) resolve(true); else reject({ ok: false, cause: (res.cause)? res.cause: 'Ocurrio un error inesperado.' });
                }).catch((error)=>reject({ ok: false, cause: 'Error de conexión.', error }));
            });
        });
    }
    modify(idSchedule: string, curse: string, data: any): Promise<boolean> {
        return new Promise((resolve, reject)=>{
            const Directives = new DirectiveSystem(this.urlBase, this.header_access);
            Directives.getDataLocal().then((value)=>{
                const postData = { editSchedule: true, username: value.username, password: value.password, idSchedule, curse: encode(curse), data: encode(JSON.stringify(data)) };
                axios.post(`${this.urlBase}/index.php`, QueryString.stringify(postData), this.header_access).then((result)=>{
                    var res: TypicalRes = result.data;
                    if (res.ok) resolve(true); else reject({ ok: false, cause: (res.cause)? res.cause: 'Ocurrio un error inesperado.' });
                }).catch((error)=>reject({ ok: false, cause: 'Error de conexión.', error }));
            });
        });
    }
    delete(idSchedule: string): Promise<boolean> {
        return new Promise((resolve, reject)=>{
            const Directives = new DirectiveSystem(this.urlBase, this.header_access);
            Directives.getDataLocal().then((value)=>{
                const postData = { deleteSchedule: true, username: value.username, password: value.password, idSchedule };
                axios.post(`${this.urlBase}/index.php`, QueryString.stringify(postData), this.header_access).then((result)=>{
                    var res: TypicalRes = result.data;
                    if (res.ok) resolve(true); else reject({ ok: false, cause: (res.cause)? res.cause: 'Ocurrio un error inesperado.' });
                }).catch((error)=>reject({ ok: false, cause: 'Error de conexión.', error }));
            });
        });
    }
    getAll(): Promise<DataSchedule[]> {
        return new Promise((resolve, reject)=>{
            const Directives = new DirectiveSystem(this.urlBase, this.header_access);
            Directives.getDataLocal().then((value)=>{
                const postData = { getAllSchedules: true, username: value.username, password: value.password };
                axios.post(`${this.urlBase}/index.php`, QueryString.stringify(postData), this.header_access).then((value)=>{
                    try {
                        var result: TypicalRes = value.data;
                        if (result.ok) return resolve(result.datas);
                        return reject({ ok: false, cause: (result.cause)? result.cause: 'Ocurrio un error inesperado.' });
                    } catch (error) {
                        reject({ ok: false, cause: 'Ocurrio un error inesperado.', relogin: true, error });
                    }
                }).catch((error)=>reject({ ok: false, cause: 'Error de conexión.', error }));
            }).catch((error)=>reject({ ok: true, cause: error.cause }));
        });
    }
}