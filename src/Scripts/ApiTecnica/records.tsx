import axios from "axios";
import qs from "qs";
import DirectiveSystem from "./directives";
import { RecordData, TypicalRes } from "./types";

export class RecordSystem {
    private urlBase: string = '';
    private header_access: { headers: { Authorization: string; } } = { headers: { Authorization: '' } };
    constructor(setUrl: string, setHeaderAccess: string) {
        this.urlBase = setUrl;
        this.header_access.headers.Authorization = setHeaderAccess;
    }
    getAll(): Promise<RecordData[]> {
        return new Promise((resolve, reject)=>{
            var Directives = new DirectiveSystem(this.urlBase, this.header_access.headers.Authorization);
            Directives.getDataLocal().then((value)=>{
                var postData = { getRecords: true, username: value.username, password: value.password };
                axios.post(this.urlBase, qs.stringify(postData), this.header_access).then((html)=>{
                    try {
                        var result: TypicalRes = html.data;
                        if (result.ok) return resolve(result.datas);
                        reject({ ok: false, cause: (result.cause)? result.cause: 'Ocurrio un error inesperado.' });
                    } catch (error) {
                        reject({ ok: false, cause: 'Ocurrio un error inesperado.', error });
                    }
                }).catch((error)=>reject({ ok: false, cause: 'Error de conexión.', error }));
            }).catch((error)=>reject({ ok: true, cause: error.cause }));
        });
    }
}