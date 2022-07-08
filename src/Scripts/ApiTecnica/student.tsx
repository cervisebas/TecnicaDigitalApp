import axios from "axios";
import { OrderCurses, ResponseGetAllStudents, StudentsData, TypicalRes } from "./types";
import DirectiveSystem from "./directives";
import QueryString from "qs";
import { decode } from "base-64";

export default class StudentSystem {
    private urlBase: string = '';
    private header_access: { headers: { Authorization: string; } } = { headers: { Authorization: '' } };
    private header_access2: { headers: { Authorization: string; 'Content-Type': string; } } = { headers: { Authorization: '', 'Content-Type': `multipart/form-data` } };
    constructor(setUrl: string, setHeaderAccess: string) {
        this.urlBase = setUrl;
        this.header_access.headers.Authorization = setHeaderAccess;
        this.header_access2.headers.Authorization = setHeaderAccess;
    }
    private cursesOrder = [
        { l: 'Profesor', v: 0},
        { l: '1°1', v: 11 },
        { l: '1°2', v: 12 },
        { l: '1°3', v: 13 },
        { l: '2°1', v: 21 },
        { l: '2°2', v: 22 },
        { l: '2°3', v: 23 },
        { l: '3°1', v: 31 },
        { l: '3°2', v: 32 },
        { l: '3°3', v: 33 },
        { l: '4°1', v: 41 },
        { l: '4°2', v: 42 },
        { l: '4°3', v: 43 },
        { l: '5°1', v: 51 },
        { l: '5°2', v: 52 },
        { l: '5°3', v: 53 },
        { l: '6°1', v: 61 },
        { l: '6°2', v: 62 },
        { l: '6°3', v: 63 },
        { l: '7°1', v: 71 },
        { l: '7°2', v: 72 },
        { l: '7°3', v: 73 }
    ];
    create(form: FormData): Promise<boolean> {
        return new Promise((resolve, reject)=>{
            axios.post(`${this.urlBase}/index.php`, form, this.header_access2).then((result)=>{
                var res: TypicalRes = result.data;
                if (res.ok) resolve(true); else reject({ ok: false, cause: (res.cause)? res.cause: 'Ocurrio un error inesperado.' });
            }).catch((error)=>reject({ ok: false, cause: 'Error de conexión.', error }));
        });
    }
    modify(form: FormData): Promise<boolean> {
        return new Promise((resolve, reject)=>{
            axios.post(`${this.urlBase}/index.php`, form, this.header_access2).then((result)=>{
                var res: TypicalRes = result.data;
                if (res.ok) resolve(true); else reject({ ok: false, cause: (res.cause)? res.cause: 'Ocurrio un error inesperado.' });
            }).catch((error)=>reject({ ok: false, cause: 'Error de conexión.', error }));
        });
    }
    delete(idStudent: string): Promise<boolean> {
        return new Promise((resolve, reject)=>{
            var Directives = new DirectiveSystem(this.urlBase, this.header_access.headers.Authorization);
            Directives.getDataLocal().then((value)=>{
                var postData = { deleteStudent: true, id: idStudent, username: value.username, password: value.password };
                axios.post(`${this.urlBase}/index.php`, QueryString.stringify(postData), this.header_access).then((value)=>{
                    try {
                        var res: ResponseGetAllStudents = value.data;
                        if (res.ok) resolve(true); else reject({ ok: false, cause: (res.cause)? res.cause: 'Ocurrio un error inesperado.' });
                    } catch (error) {
                        reject({ ok: false, cause: 'Ocurrio un error inesperado.', relogin: true, error });
                    }
                }).catch((error)=>reject({ ok: false, cause: 'Error de conexión.', error }));
            }).catch((error)=>reject({ ok: true, cause: error.cause }));
        });
    }
    getAll(): Promise<{ curses: OrderCurses[], students: StudentsData[] }> {
        return new Promise((resolve, reject)=>{
            var Directives = new DirectiveSystem(this.urlBase, this.header_access.headers.Authorization);
            Directives.getDataLocal().then((value)=>{
                var postData = { getAllStudent: true, username: value.username, password: value.password };
                axios.post(`${this.urlBase}/index.php`, QueryString.stringify(postData), this.header_access).then((value)=>{
                    try {
                        var result: ResponseGetAllStudents = value.data;
                        if (result.ok) {
                            var curses: OrderCurses[] = [];
                            var data: StudentsData[] = (result.datas)? result.datas: [];
                            data.forEach((value)=>{
                                var find = curses.findIndex((e)=>e.label == decode(value.curse));
                                if (find == -1) {
                                    var level = this.cursesOrder.find((i)=>decode(value.curse).indexOf(i.l) !== -1);
                                    return curses.push({ label: decode(value.curse), students: [value], level: (level)? level.v: -1 });
                                }
                                curses[find].students.push(value);
                            });
                            curses.sort((a, b)=>a.level - b.level);
                            return resolve({ curses, students: data });
                        };
                        return reject({ ok: false, cause: (result.cause)? result.cause: 'Ocurrio un error inesperado.' });
                    } catch (error) {
                        reject({ ok: false, cause: 'Ocurrio un error inesperado.', relogin: true, error });
                    }
                }).catch((error)=>reject({ ok: false, cause: 'Error de conexión.', error }));
            }).catch((error)=>reject({ ok: true, cause: error.cause }));
        });
    }
}