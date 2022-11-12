import axios from "axios";
import qs from "qs";
import DirectiveSystem from "./directives";
import { AnnotationList, ApiHeader, TypicalRes } from "./types";

export default class AnnotationSystem {
    private urlBase: string = '';
    private header_access: any;
    constructor(setUrl: string, setHeaderAccess: ApiHeader) {
        this.urlBase = setUrl;
        this.header_access = setHeaderAccess;
    }
    set(idGroup: string, note: string): Promise<boolean> {
        return new Promise((resolve, reject)=>{
            try {
                var Directives = new DirectiveSystem(this.urlBase, this.header_access);
                Directives.getDataLocal().then((session)=>{
                    var dataPost = { setAnnotationAssist: true, idGroup, note, username: session.username, password: session.password };
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
    getAll(idGroup: string): Promise<AnnotationList[]> {
        return new Promise((resolve, reject)=>{
            try {
                var Directives = new DirectiveSystem(this.urlBase, this.header_access);
                Directives.getDataLocal().then((session)=>{
                    var dataPost = { getGroupAnnotationAssist: true, idGroup, username: session.username, password: session.password };
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
    delete(idGroup: string): Promise<boolean> {
        return new Promise((resolve, reject)=>{
            try {
                var Directives = new DirectiveSystem(this.urlBase, this.header_access);
                Directives.getDataLocal().then((session)=>{
                    var dataPost = { deleteAnnotationAssist: true, idGroup, username: session.username, password: session.password };
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