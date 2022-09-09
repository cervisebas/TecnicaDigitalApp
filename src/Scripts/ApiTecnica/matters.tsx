import axios from "axios";
import QueryString from "qs";
import DirectiveSystem from "./directives";
import { Matter, TypicalRes } from "./types";

export default class MatterScheduleSystem {
    private urlBase: string = '';
    private header_access: { headers: { Authorization: string; } } = { headers: { Authorization: '' } };
    constructor(setUrl: string, setHeaderAccess: string) {
        this.urlBase = setUrl;
        this.header_access.headers.Authorization = setHeaderAccess;
    }
    create(idTeacher: string, name: string): Promise<boolean> {
        return new Promise((resolve, reject)=>{
            const Directives = new DirectiveSystem(this.urlBase, this.header_access.headers.Authorization);
            Directives.getDataLocal().then((value)=>{
                const postData = { addMatter: true, username: value.username, password: value.password, idTeacher, name };
                axios.post(`${this.urlBase}/index.php`, QueryString.stringify(postData), this.header_access).then((result)=>{
                    var res: TypicalRes = result.data;
                    if (res.ok) resolve(true); else reject({ ok: false, cause: (res.cause)? res.cause: 'Ocurrio un error inesperado.' });
                }).catch((error)=>reject({ ok: false, cause: 'Error de conexión.', error }));
            });
        });
    }
    delete(idMatter: string): Promise<boolean> {
        return new Promise((resolve, reject)=>{
            const Directives = new DirectiveSystem(this.urlBase, this.header_access.headers.Authorization);
            Directives.getDataLocal().then((value)=>{
                const postData = { deleteMatter: true, username: value.username, password: value.password, idMatter };
                axios.post(`${this.urlBase}/index.php`, QueryString.stringify(postData), this.header_access).then((result)=>{
                    var res: TypicalRes = result.data;
                    if (res.ok) resolve(true); else reject({ ok: false, cause: (res.cause)? res.cause: 'Ocurrio un error inesperado.' });
                }).catch((error)=>reject({ ok: false, cause: 'Error de conexión.', error }));
            });
        });
    }
    getAll(): Promise<Matter[]> {
        return new Promise((resolve, reject)=>{
            const Directives = new DirectiveSystem(this.urlBase, this.header_access.headers.Authorization);
            Directives.getDataLocal().then((value)=>{
                const postData = { getAllMatters: true, username: value.username, password: value.password };
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