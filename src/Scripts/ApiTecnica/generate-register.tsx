import { Image } from "react-native";
import { decode } from "base-64";
import RNHTMLtoPDF from "react-native-html-to-pdf";

type student = {
    name: string;
    status: boolean;
};

export default class GenerateRegister {
    constructor() {}
    get(curse: string, date: string, hour: string, students: student[]) {
        const tr = this.getTr(students);
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
                <title>Registro ${curse}</title>
            </head>
            <body>
                <div class="header">
                    <div class="title">
                        <h1>PLANILLA DE ASISTENCIA</h1>
                    </div>
                </div>
                <div class="content-props">
                    <div class="props">
                        <div class="prop"><p>CURSO:</p><p class="value">${curse}</p></div>
                        <div class="prop"><p>FECHA:</p><p class="value">${date}</p></div>
                        <div class="prop"><p>HORA:</p><p class="value">${hour}</p></div>
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
    getTr(data: student[]) {
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
    generatePdf(data: { curse: string; date: string; hour: string; students: student[]; }): Promise<string> {
        return new Promise((resolve, reject)=>{
            try {
                var nameFile = `Registro ${data.curse.replace('°', '-')} - ${data.date.replace(/\//gi, '-')}`;
                var htmlFinal = this.get(data.curse, data.date, data.hour, data.students).replace(/\n/gi, '');
                var options: RNHTMLtoPDF.Options = {
                    html: htmlFinal,
                    fileName: nameFile,
                    width: 595,
                    directory: 'Documents',
                    fonts: [Image.resolveAssetSource(require('../../Fonts/Arialn.ttf')).uri]
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