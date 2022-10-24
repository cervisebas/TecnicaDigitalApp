import { Image } from "react-native";
import RNHTMLtoPDF from "react-native-html-to-pdf";

function getHTML(curse: string, rows1: string[][], rows2: string[][]) {
    return(`<!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Horario ${curse}</title>
        <style>
            * {
                font-family: Arial, Helvetica, sans-serif;
            }
            div.pages {
                /*position: absolute;
                top: 0;
                left: 0;
                width: 595px;
                height: 842px;*/
                width: 100%;
                height: 100%;
                overflow: visible;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-direction: column;
            }
            table, th, td {
                border: 2px solid black;
                border-collapse: collapse;
            }
            table {
                width: calc(100% - 64px);
            }
            table p {
                margin: 0;
            }
            table p.center {
                width: 100%;
                height: 100%;
                text-align: center;
            }
            table p.matter {
                width: 100%;
                height: 100%;
                text-align: center;
            }
            table h2 {
                margin: 0;
                width: 100%;
                text-align: center;
                font-weight: 600;
                font-size: 24px;
            }
            table tr td {
                padding-top: 8px;
                padding-bottom: 8px;
                padding-left: 6px;
                padding-right: 6px;
            }
            table tr.title {
                background-color: #6EA9F9;
            }
            table tr.title h2 {
                font-size: 18px;
                height: 100%;
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            table tr.days {
                overflow: hidden;
                background-color: #9FC6F9;
            }
            table tr.days p {
                font-size: 16px;
                font-weight: 600;
            }
            table td.time {
                background-color: #CEE3fC;
            }
            table td.time p {
                font-size: 16px;
                font-weight: 600;
            }
            table td p {
                font-size: 12px;
            }
        </style>
    </head>
    <body>
        <div class="pages">
            <table>
                <!-- Turno mañana -->
                <tr class="title"><td colspan="6"><h2>Turno Mañana</h2></td></tr>
                <tr class="days">
                    <td></td>
                    <td><p class="center">Lunes</p></td>
                    <td><p class="center">Martes</p></td>
                    <td><p class="center">Miercoles</p></td>
                    <td><p class="center">Jueves</p></td>
                    <td><p class="center">Viernes</p></td>
                </tr>
                <tr>
                    <td class="time"><p class="center">7:30<br>A<br>8:30</p></td>
                    <td><p class="matter">${rows1[0][0]}</p></td>
                    <td><p class="matter">${rows1[0][1]}</p></td>
                    <td><p class="matter">${rows1[0][2]}</p></td>
                    <td><p class="matter">${rows1[0][3]}</p></td>
                    <td><p class="matter">${rows1[0][4]}</p></td>
                </tr>
                <tr>
                    <td class="time"><p class="center">8:40<br>A<br>9:40</p></td>
                    <td><p class="matter">${rows1[1][0]}</p></td>
                    <td><p class="matter">${rows1[1][1]}</p></td>
                    <td><p class="matter">${rows1[1][2]}</p></td>
                    <td><p class="matter">${rows1[1][3]}</p></td>
                    <td><p class="matter">${rows1[1][4]}</p></td>
                </tr>
                <tr>
                    <td class="time"><p class="center">9:50<br>A<br>10:50</p></td>
                    <td><p class="matter">${rows1[2][0]}</p></td>
                    <td><p class="matter">${rows1[2][1]}</p></td>
                    <td><p class="matter">${rows1[2][2]}</p></td>
                    <td><p class="matter">${rows1[2][3]}</p></td>
                    <td><p class="matter">${rows1[2][4]}</p></td>
                </tr>
                <tr>
                    <td class="time"><p class="center">11:00<br>A<br>12:00</p></td>
                    <td><p class="matter">${rows1[3][0]}</p></td>
                    <td><p class="matter">${rows1[3][1]}</p></td>
                    <td><p class="matter">${rows1[3][2]}</p></td>
                    <td><p class="matter">${rows1[3][3]}</p></td>
                    <td><p class="matter">${rows1[3][4]}</p></td>
                </tr>
                
                <!-- Turno tarde -->
                <tr class="title"><td colspan="6"><h2>Turno Tarde</h2></td></tr>
                <tr class="days">
                    <td></td>
                    <td><p class="center">Lunes</p></td>
                    <td><p class="center">Martes</p></td>
                    <td><p class="center">Miercoles</p></td>
                    <td><p class="center">Jueves</p></td>
                    <td><p class="center">Viernes</p></td>
                </tr>
                <tr>
                    <td class="time"><p class="center">13:15<br>A<br>14:15</p></td>
                    <td><p class="matter">${rows2[0][0]}</p></td>
                    <td><p class="matter">${rows2[0][1]}</p></td>
                    <td><p class="matter">${rows2[0][2]}</p></td>
                    <td><p class="matter">${rows2[0][3]}</p></td>
                    <td><p class="matter">${rows2[0][4]}</p></td>
                </tr>
                <tr>
                    <td class="time"><p class="center">14:25<br>A<br>15:25</p></td>
                    <td><p class="matter">${rows2[1][0]}</p></td>
                    <td><p class="matter">${rows2[1][1]}</p></td>
                    <td><p class="matter">${rows2[1][2]}</p></td>
                    <td><p class="matter">${rows2[1][3]}</p></td>
                    <td><p class="matter">${rows2[1][4]}</p></td>
                </tr>
                <tr>
                    <td class="time"><p class="center">15:35<br>A<br>16:35</p></td>
                    <td><p class="matter">${rows2[2][0]}</p></td>
                    <td><p class="matter">${rows2[2][1]}</p></td>
                    <td><p class="matter">${rows2[2][2]}</p></td>
                    <td><p class="matter">${rows2[2][3]}</p></td>
                    <td><p class="matter">${rows2[2][4]}</p></td>
                </tr>
                <tr>
                    <td class="time"><p class="center">16:45<br>A<br>17:45</p></td>
                    <td><p class="matter">${rows2[3][0]}</p></td>
                    <td><p class="matter">${rows2[3][1]}</p></td>
                    <td><p class="matter">${rows2[3][2]}</p></td>
                    <td><p class="matter">${rows2[3][3]}</p></td>
                    <td><p class="matter">${rows2[3][4]}</p></td>
                </tr>
            </table>
        </div>
    </body>
    </html>`);
}

export default function (curse: string, rows1: string[][], rows2: string[][]): Promise<string> {
    return new Promise((resolve, reject)=>{
        try {
            var nameFile = `Horario ${curse.replace('°', '-')}`;
            var htmlFinal = getHTML(curse, rows1, rows2).replace(/\n/gi, '');
            var options: RNHTMLtoPDF.Options = {
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