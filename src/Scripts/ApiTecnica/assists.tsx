import axios from "axios";
import { encode } from "base-64";
import moment from "moment";
import qs from "qs";
import DirectiveSystem from "./directives";
import { AssistIndividualData, AssistUserData, DataGroup, DataList, ResponseGetAllDataGroups, ResponseGetAssistList, TypicalRes } from "./types";

type TimesAccept = {
    hour: number;
    minMinutes: number;
    maxMinutes: number;
    result: string;
};

export default class AssistSystem {
    private urlBase: string = '';
    private header_access: { headers: { Authorization: string; } } = { headers: { Authorization: '' } };
    constructor(setUrl: string, setHeaderAccess: string) {
        this.urlBase = setUrl;
        this.header_access.headers.Authorization = setHeaderAccess;
    }
    create(curse: string, date?: string | undefined, hour?: string | undefined): Promise<string> {
        return new Promise((resolve, reject)=>{
            try {
                var Directives = new DirectiveSystem(this.urlBase, this.header_access.headers.Authorization);
                Directives.getDataLocal().then((session)=>{
                    var getActual = this.getCalcHour();
                    if (!hour && !getActual) return reject('Fuera de horario');
                    var postDate: string = (!date)? encode(moment().format('DD/MM/YYYY')): date;
                    var postHour: string = (!hour)? encode(String(getActual)): hour;
                    var dataPost = { createGroupAssist: true, curse, date: postDate, hour: postHour, username: session.username, password: session.password };
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
    getGroups(): Promise<DataGroup[]> {
        return new Promise((resolve, reject)=>{
            try {
                var Directives = new DirectiveSystem(this.urlBase, this.header_access.headers.Authorization);
                Directives.getDataLocal().then((session)=>{
                    var dataPost = { getAllGroupAssist: true, username: session.username, password: session.password };
                    axios.post(`${this.urlBase}/index.php`, qs.stringify(dataPost), this.header_access).then((result)=>{
                        var res: ResponseGetAllDataGroups = result.data;
                        if (res.ok) resolve((res.datas)? res.datas: []); else reject({ ok: false, cause: (res.cause)? res.cause: 'Ocurrio un error inesperado.' });
                    }).catch((error)=>reject({ ok: false, cause: 'Error de conexión.', error }));
                }).catch((error)=>reject({ ok: true, cause: error.cause }));
            } catch (error) {
                reject({ ok: false, cause: 'Ocurrio un error inesperado.', error });
            }
        });
    }
    getGroupsTeachers(): Promise<DataGroup[]> {
        return new Promise((resolve, reject)=>{
            try {
                var Directives = new DirectiveSystem(this.urlBase, this.header_access.headers.Authorization);
                Directives.getDataLocal().then((session)=>{
                    var dataPost = { getAllGroupTeachersAssist: true, username: session.username, password: session.password };
                    axios.post(`${this.urlBase}/index.php`, qs.stringify(dataPost), this.header_access).then((result)=>{
                        var res: ResponseGetAllDataGroups = result.data;
                        if (res.ok) resolve((res.datas)? res.datas: []); else reject({ ok: false, cause: (res.cause)? res.cause: 'Ocurrio un error inesperado.' });
                    }).catch((error)=>reject({ ok: false, cause: 'Error de conexión.', error }));
                }).catch((error)=>reject({ ok: true, cause: error.cause }));
            } catch (error) {
                reject({ ok: false, cause: 'Ocurrio un error inesperado.', error });
            }
        });
    }
    getGroup(idGroup: string): Promise<AssistUserData[]> {
        return new Promise((resolve, reject)=>{
            try {
                var Directives = new DirectiveSystem(this.urlBase, this.header_access.headers.Authorization);
                Directives.getDataLocal().then((session)=>{
                    var dataPost = { getGroupAssist: true, username: session.username, password: session.password, id: idGroup };
                    axios.post(`${this.urlBase}/index.php`, qs.stringify(dataPost), this.header_access).then((result)=>{
                        var res: ResponseGetAssistList = result.data;
                        if (res.ok) resolve((res.datas)? res.datas: []); else reject({ ok: false, cause: (res.cause)? res.cause: 'Ocurrio un error inesperado.' });
                    }).catch((error)=>reject({ ok: false, cause: 'Error de conexión.', error }));
                }).catch((error)=>reject({ ok: true, cause: error.cause }));
            } catch (error) {
                reject({ ok: false, cause: 'Ocurrio un error inesperado.', error });
            }
        });
    }
    confirmAssist(idGroup: string, notify: boolean, datasList: DataList[], isFilter?: boolean): Promise<boolean> {
        return new Promise((resolve, reject)=>{
            try {
                var Directives = new DirectiveSystem(this.urlBase, this.header_access.headers.Authorization);
                Directives.getDataLocal().then((session)=>{
                    var dataPost = { confirmGroupAssist: true, username: session.username, password: session.password, idGroup, isFilter: (isFilter)? '1': '0', notify: (notify)? '1': '0', datas: encode(JSON.stringify(datasList)) };
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
    deleteAssist(idGroup: string): Promise<boolean> {
        return new Promise((resolve, reject)=>{
            try {
                var Directives = new DirectiveSystem(this.urlBase, this.header_access.headers.Authorization);
                Directives.getDataLocal().then((session)=>{
                    var dataPost = { deleteGroupAssist: true, username: session.username, password: session.password, idGroup: idGroup };
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
    getIndividual(idStudent: string): Promise<AssistIndividualData[]> {
        return new Promise((resolve, reject)=>{
            try {
                var Directives = new DirectiveSystem(this.urlBase, this.header_access.headers.Authorization);
                Directives.getDataLocal().then((session)=>{
                    var dataPost = { getIndividualAssist: true, username: session.username, password: session.password, idStudent };
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

    // Teacher
    addTeacherAssist(idGroup: string, idTeacher: string): Promise<string> {
        return new Promise((resolve, reject)=>{
            try {
                var Directives = new DirectiveSystem(this.urlBase, this.header_access.headers.Authorization);
                Directives.getDataLocal().then((session)=>{
                    const dataPost = { addTeacherAssist: true, username: session.username, password: session.password, idGroup, idTeacher };
                    axios.post(`${this.urlBase}/index.php`, qs.stringify(dataPost), this.header_access).then((result)=>{
                        const res: TypicalRes = result.data;
                        if (res.ok) resolve(res.datas); else reject({ ok: false, cause: (res.cause)? res.cause: 'Ocurrio un error inesperado.' });
                    }).catch((error)=>reject({ ok: false, cause: 'Error de conexión.', error }));
                }).catch((error)=>reject({ ok: true, cause: error.cause }));
            } catch (error) {
                reject({ ok: false, cause: 'Ocurrio un error inesperado.', error });
            }
        });
    }
    removeTeacherAssist(idGroup: string, idTeacher: string): Promise<void> {
        return new Promise((resolve, reject)=>{
            try {
                var Directives = new DirectiveSystem(this.urlBase, this.header_access.headers.Authorization);
                Directives.getDataLocal().then((session)=>{
                    const dataPost = { removeTeacherAssist: true, username: session.username, password: session.password, idGroup, idTeacher };
                    axios.post(`${this.urlBase}/index.php`, qs.stringify(dataPost), this.header_access).then((result)=>{
                        const res: TypicalRes = result.data;
                        if (res.ok) resolve(); else reject({ ok: false, cause: (res.cause)? res.cause: 'Ocurrio un error inesperado.' });
                    }).catch((error)=>reject({ ok: false, cause: 'Error de conexión.', error }));
                }).catch((error)=>reject({ ok: true, cause: error.cause }));
            } catch (error) {
                reject({ ok: false, cause: 'Ocurrio un error inesperado.', error });
            }
        });
    }
    modifyTeacherAssist(idGroup: string, idTeacher: string, status: boolean): Promise<void> {
        return new Promise((resolve, reject)=>{
            try {
                var Directives = new DirectiveSystem(this.urlBase, this.header_access.headers.Authorization);
                Directives.getDataLocal().then((session)=>{
                    const dataPost = { modifyTeacherAssist: true, username: session.username, password: session.password, idGroup, idTeacher, status: (status)? '1': '0' };
                    axios.post(`${this.urlBase}/index.php`, qs.stringify(dataPost), this.header_access).then((result)=>{
                        const res: TypicalRes = result.data;
                        if (res.ok) resolve(); else reject({ ok: false, cause: (res.cause)? res.cause: 'Ocurrio un error inesperado.' });
                    }).catch((error)=>reject({ ok: false, cause: 'Error de conexión.', error }));
                }).catch((error)=>reject({ ok: true, cause: error.cause }));
            } catch (error) {
                reject({ ok: false, cause: 'Ocurrio un error inesperado.', error });
            }
        });
    }

    getCalcHour(date?: Date): string | boolean {
        var now: { hour: number, minutes: number } = { hour: parseInt(moment(date).format('HH')), minutes: parseInt(moment(date).format('mm')) };
        var times: TimesAccept[] = [
        /* ##### Mañana ##### */
            /* ##### 7:15 ##### */
            { hour: 7, minMinutes: 0, maxMinutes: 30, result: '7:15' },
            /* ##### 8:40 ##### */
            { hour: 8, minMinutes: 25, maxMinutes: 55, result: '8:40' },
            /* ##### 9:50 ##### */
            { hour: 9, minMinutes: 35, maxMinutes: 59, result: '9:50' },
            { hour: 10, minMinutes: 0, maxMinutes: 5, result: '9:50' },
            /* ##### 10:50 ##### */
            { hour: 10, minMinutes: 45, maxMinutes: 59, result: '11:00' },
            { hour: 11, minMinutes: 0, maxMinutes: 15, result: '11:00' },
        /* ##### Tarde ##### */
            /* ##### 13:15 ##### */
            { hour: 13, minMinutes: 0, maxMinutes: 30, result: '13:15' },
            /* ##### 14:25 ##### */
            { hour: 14, minMinutes: 5, maxMinutes: 35, result: '14:25' },
            /* ##### 10:35 ##### */
            { hour: 15, minMinutes: 15, maxMinutes: 45, result: '15:35' },
            /* ##### 10:45 ##### */
            { hour: 16, minMinutes: 25, maxMinutes: 55, result: '16:45' }
        ];
        var find = times.find((value)=>{
            if (value.hour == now.hour) {
                if (now.minutes >= value.minMinutes && now.minutes <= value.maxMinutes) {
                    return value;
                }
            }
        });
        if (find) return find.result;
        return false;
    }
}