import { Image } from "react-native";
import { decode } from "base-64";
import RNHTMLtoPDF from "react-native-html-to-pdf";
import { AssistUserData } from "./ApiTecnica/types";

export default new class GeneratePDFTeachers {
    constructor() {}
    get(id: string, date: string, turn: string, teachers: AssistUserData[]) {
        const tr = this.getTr(teachers);
        return `<!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    * {
                        font-family: Arial, Helvetica, sans-serif;
                    }
                    table {
                        width: 100%;
                    }
                    div.header {
                        width: 100%;
                        display: flex;
                        justify-content: center;
                    }
                    div.header div.title {
                        width: max-content;
                        height: min-content;
                        border: 2px solid #000000;
                        padding-top: 4px;
                        padding-bottom: 4px;
                        padding-left: 10px;
                        padding-right: 10px;
                    }
                    div.header div.title h1 {
                        margin: 0;
                        padding: 0;
                        font-size: 26px;
                    }
                    div.content-props {
                        width: 100%;
                        display: flex;
                        justify-content: center;
                    }
                    div.content-props div.props {
                        width: 90%;
                        display: flex;
                        flex-direction: row;
                        align-items: center;
                    }
                    div.content-props div.props div.prop {
                        width: 100%;
                        margin-top: 16px;
                        margin-bottom: 12px;
                        display: flex;
                        flex-direction: row;
                    }
                    div.content-props div.props div.prop p {
                        margin: 0;
                        padding: 0;
                        font-weight: bold;
                        font-size: 12px;
                    }
                    div.content-props div.props div.prop p.value {
                        margin-left: 2px;
                        font-weight: normal;
                    }
                    table, th, td {
                        border: 1.5px solid black;
                        border-collapse: collapse;
                    }
                    table td.center {
                        text-align: center !important;
                    }
                    table td.center p {
                        margin-left: 0 !important;
                    }
                    table td p {
                        margin-top: 6px;
                        margin-bottom: 6px;
                        margin-left: 6px;
                        margin-right: 0;
                    }
                    table tr.bold p {
                        font-weight: 500;
                    }
                </style>
                <title>Registro #${id}</title>
            </head>
            <body>
                <div class="header">
                    <div class="title">
                        <h1>PLANILLA DE ASISTENCIA</h1>
                    </div>
                </div>
                <div class="content-props">
                    <div class="props">
                        <div class="prop"><p>AREA:</p><p class="value">Profesores</p></div>
                        <div class="prop"><p>FECHA:</p><p class="value">${date}</p></div>
                        <div class="prop"><p>TURNO:</p><p class="value">${turn}</p></div>
                    </div>
                </div>
                <table>
                    <tr class="bold">
                        <td class="center"><p>N°</p></td>
                        <td><p>ALUMNO/A</p></td>
                        <td class="center"><p>ESTADO</p></td>
                    </tr>
                    ${tr}
                </table>
            </body>
        </html>`;
    }
    getTr(data: AssistUserData[]) {
        var trs: string = '';
        data.forEach((value, index)=>{
            trs += `<tr>
                <td class="center"><p>${index+1}</p></td>
                <td><p>${decode(value.name)}</p></td>
                <td class="center"><p>${(value.status)? 'P': 'A'}</p></td>
            </tr>`;
        });
        return trs;
    }
    generatePdf(data: { id: string; date: string; turn: string; teachers: AssistUserData[]; }): Promise<string> {
        return new Promise((resolve, reject)=>{
            try {
                const nameFile = `Registro #${data.id} - ${data.date.replace(/\//gi, '-')}`;
                const htmlFinal = this.get(data.id, data.date, data.turn, data.teachers).replace(/\n/gi, '');
                const options: RNHTMLtoPDF.Options = {
                    html: htmlFinal,
                    fileName: nameFile,
                    width: 595,
                    directory: 'Documents',
                    fonts: [Image.resolveAssetSource(require('../Fonts/Arialn.ttf')).uri]
                };
                RNHTMLtoPDF.convert(options)
                    .then((value)=>(value.filePath)? resolve(value.filePath): reject('Ocurrió un error al generar el archivo.'))
                    .catch(()=>reject('Ocurrió un error al generar el archivo.'));
            } catch {
                return reject('Ocurrió un error inesperado.');
            }
        });
    }
}