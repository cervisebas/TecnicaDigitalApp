import axios from "axios";
import qs from "qs";
import DirectiveSystem from "./directives";
import { ApiHeader, OldData, TypicalRes } from "./types";

export class OldDataSystem {
    private urlBase: string = '';
    private header_access: any;
    constructor(setUrl: string, setHeaderAccess: ApiHeader) {
        this.urlBase = setUrl;
        this.header_access = setHeaderAccess;
    }
    getAll(): Promise<OldData[]> {
        return new Promise((resolve, reject)=>{
            var Directives = new DirectiveSystem(this.urlBase, this.header_access);
            Directives.getDataLocal().then((value)=>{
                const postData = { getAllOldData: true, username: value.username, password: value.password };
                axios.post(`${this.urlBase}/index.php`, qs.stringify(postData), this.header_access).then((html)=>{
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