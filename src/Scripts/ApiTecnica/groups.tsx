import axios from "axios";
import { Groups, TypicalRes } from "./types";
import DirectiveSystem from "./directives";
import QueryString from "qs";
import { decode } from "base-64";

export default class CursesGroupSystem {
    private urlBase: string = '';
    private header_access: { headers: { Authorization: string; } } = { headers: { Authorization: '' } };
    private header_access2: { headers: { Authorization: string; 'Content-Type': string; } } = { headers: { Authorization: '', 'Content-Type': `multipart/form-data` } };
    constructor(setUrl: string, setHeaderAccess: string) {
        this.urlBase = setUrl;
        this.header_access.headers.Authorization = setHeaderAccess;
        this.header_access2.headers.Authorization = setHeaderAccess;
    }
    create(curse: string, group: string, students: string): Promise<boolean> {
        return new Promise((resolve, reject)=>{
            const Directives = new DirectiveSystem(this.urlBase, this.header_access.headers.Authorization);
            Directives.getDataLocal().then((value)=>{
                const postData = { addCurseGroup: true, username: value.username, password: value.password, curse, group, students };
                axios.post(`${this.urlBase}/index.php`, QueryString.stringify(postData), this.header_access).then((result)=>{
                    var res: TypicalRes = result.data;
                    if (res.ok) resolve(true); else reject({ ok: false, cause: (res.cause)? res.cause: 'Ocurrio un error inesperado.' });
                }).catch((error)=>reject({ ok: false, cause: 'Error de conexión.', error }));
            });
        });
    }
    modify(idEdit: string, curse?: string | undefined, group?: string | undefined, students?: string | undefined): Promise<boolean> {
        return new Promise((resolve, reject)=>{
            const Directives = new DirectiveSystem(this.urlBase, this.header_access.headers.Authorization);
            Directives.getDataLocal().then((value)=>{
                const postData = {
                    editCurseGroup: true,
                    username: value.username,
                    password: value.password,
                    idEdit,
                    curse: (curse)? curse: '',
                    group: (group)? group: '',
                    students: (students)? students: ''
                };
                axios.post(`${this.urlBase}/index.php`, QueryString.stringify(postData), this.header_access).then((result)=>{
                    var res: TypicalRes = result.data;
                    if (res.ok) resolve(true); else reject({ ok: false, cause: (res.cause)? res.cause: 'Ocurrio un error inesperado.' });
                }).catch((error)=>reject({ ok: false, cause: 'Error de conexión.', error }));
            });
        });
    }
    delete(idGroup: string): Promise<boolean> {
        return new Promise((resolve, reject)=>{
            const Directives = new DirectiveSystem(this.urlBase, this.header_access.headers.Authorization);
            Directives.getDataLocal().then((value)=>{
                const postData = { deleteCurseGroup: true, idGroup, username: value.username, password: value.password };
                axios.post(`${this.urlBase}/index.php`, QueryString.stringify(postData), this.header_access).then((value)=>{
                    try {
                        const res: TypicalRes = value.data;
                        if (res.ok) resolve(true); else reject({ ok: false, cause: (res.cause)? res.cause: 'Ocurrio un error inesperado.' });
                    } catch (error) {
                        reject({ ok: false, cause: 'Ocurrio un error inesperado.', relogin: true, error });
                    }
                }).catch((error)=>reject({ ok: false, cause: 'Error de conexión.', error }));
            }).catch((error)=>reject({ ok: true, cause: error.cause }));
        });
    }
    getAll(): Promise<Groups[]> {
        return new Promise((resolve, reject)=>{
            const Directives = new DirectiveSystem(this.urlBase, this.header_access.headers.Authorization);
            Directives.getDataLocal().then((value)=>{
                const postData = { getAllCursesGroups: true, username: value.username, password: value.password };
                axios.post(`${this.urlBase}/index.php`, QueryString.stringify(postData), this.header_access).then((value)=>{
                    try {
                        var result: TypicalRes = value.data;
                        if (result.ok) {
                            const datas = result.datas.map((data: any)=>({
                                id: data.id,
                                curse: data.curse,
                                name_group: data.name_group,
                                students: JSON.parse(decode(data.students))
                            }));
                            return resolve(datas);
                        }
                        return reject({ ok: false, cause: (result.cause)? result.cause: 'Ocurrio un error inesperado.' });
                    } catch (error) {
                        reject({ ok: false, cause: 'Ocurrio un error inesperado.', relogin: true, error });
                    }
                }).catch((error)=>reject({ ok: false, cause: 'Error de conexión.', error }));
            }).catch((error)=>reject({ ok: true, cause: error.cause }));
        });
    }
}