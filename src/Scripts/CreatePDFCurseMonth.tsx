import { Image } from "react-native";
import { decode } from "base-64";
import RNHTMLtoPDF from "react-native-html-to-pdf";
import { AssistForMonth } from "./ApiTecnica/types";
import { daysInMonth, getBusinessDatesCount } from "./Utils";
import { months } from "moment";

const listMonths = [
    { index: 1, name: 'Enero'},
    { index: 2, name: 'Febrero'},
    { index: 3, name: 'Marzo'},
    { index: 4, name: 'Abril'},
    { index: 5, name: 'Mayo'},
    { index: 6, name: 'Junio'},
    { index: 7, name: 'Julio'},
    { index: 8, name: 'Agosto'},
    { index: 9, name: 'Septiembre'},
    { index: 10, name: 'Octubre'},
    { index: 11, name: 'Noviembre'},
    { index: 12, name: 'Diciembre'}
];


function getHTML(curse: string, age: string, month: string, realMonth: number, data: AssistForMonth['result']) {
    const ageNumber = parseInt(age);
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
            table:not(.ignore) {
                width: 100%;
                page-break-inside: auto;
            }
            tr {
                page-break-inside:avoid;
                page-break-after:auto; 
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
                align-items: center;
                justify-content: center;
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
                width: 28px;
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
            table td.padding {
                padding-left: 4px;
                padding-right: 12px;
            }
            table.ignore {
                margin-top: 16px;
            }
            table td.padding2 {
                padding-left: 8px;
                padding-right: 8px;
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
                <div class="prop"><p>MES:</p><p class="value">${month.toUpperCase()}</p></div>
                <div class="prop"><p>AÑO:</p><p class="value">${age}</p></div>
            </div>
        </div>
        <table>
            <tr class="bold">
                <td class="center"><p>N°</p></td>
                <td><p>ALUMNO/A</p></td>
                ${getElementsDays(realMonth, ageNumber)}
            </tr>
            ${getRows(realMonth, ageNumber, data)}
        </table>
        ${getStadistics(realMonth, ageNumber, data)}
    </body>
    </html>`;
}

function getElementsDays(month: number, age: number) {
    const numberDays = daysInMonth(month, age);
    let result = '';
    for (let i = 0; i < numberDays; i++) {
        result += `<td class="center"><p>${i+1}</p></td>`;
    }
    return result;
}
function getRows(month: number, age: number, data: AssistForMonth['result']) {
    // Variables of order
    const numberDays = daysInMonth(month, age);
    var list: {
        student: string;
        list: {
            day: number;
            text: string;
        }[];
    }[] = [];

    // Ordernar listado por estudiante
    data.forEach((value)=>{
        const dayNumber = parseInt(decode(value.date).split('/')[0]);
        value.data.forEach((st)=>{
            const status = (st.status)? 'P': 'A';
            const nameDecode = decode(st.name);
            const findIndex = list.findIndex((f)=>f.student == nameDecode);
            if (findIndex == -1) return list.push({
                student: nameDecode,
                list: [{ day: dayNumber, text: status }]
            });
            const findDay = list[findIndex].list.findIndex((d)=>d.day == dayNumber);
            if (findDay != -1) return list[findIndex].list[findDay].text += `/${status}`;
            list[findIndex].list.push({
                day: dayNumber,
                text: status
            });
        });
    });

    // Completar dias faltantes
    list.forEach((st, index)=>{
        for (let i = 0; i < numberDays; i++) {
            const dayNumber = i + 1;
            if (!st.list.find((l)=>l.day == dayNumber)) {
                list[index].list.push({
                    day: dayNumber,
                    text: '~'
                });
            }
        }
    });

    // Ordernar lista por nombre
    list = list.sort((a, b) => {
        const nameA = a.student.toUpperCase();
        const nameB = b.student.toUpperCase();
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
    });

    // Ordenar lista de estudiantes por dia
    for (let i = 0; i < list.length; i++) {
        list[i].list = list[i].list.sort((a, b)=>a.day - b.day);
    }

    // Generate HTML
    var resultHTML = '';
    list.forEach((st, index)=>{
        let listOfAssist = '';
        st.list.forEach((a)=>listOfAssist += `<td class="center"><p>${a.text}</p></td>`);
        resultHTML += `<tr class="student">
            <td class="center"><p>${index+1}</p></td>
            <td><p>${st.student}</p></td>
            ${listOfAssist}
        </tr>`;
    });

    return resultHTML;
}

function getStadistics(month: number, year: number, data: AssistForMonth['result']) {
    // Orden de datos
    var assist = 0;
    var notAssist = 0;
    var total = 0;
    data.forEach((day)=>{
        day.data.forEach((value)=>{
            if (value.status) assist += 1; else notAssist += 1;
            total += 1;
        });
    });

    // Calculos de la asistencia
    const percent = ((assist * 100)/total).toFixed(2);
    const media = (total / getBusinessDatesCount(month, year)).toFixed(2);

    //   Porcentaje Media
    return `<table class="ignore">
        <tr class="bold">
            <td class="padding"><p>Asistencia:</p></td>
            <td class="center padding2"><p>${assist}</p></td>
        </tr>
        <tr class="bold">
            <td class="padding"><p>Inasistencia:</p></td>
            <td class="center padding2"><p>${notAssist}</p></td>
        </tr>
        <tr class="bold">
            <td class="padding"><p>Porcentaje:</p></td>
            <td class="center padding2"><p>${percent}%</p></td>
        </tr>
        <tr class="bold">
            <td class="padding"><p>Media:</p></td>
            <td class="center padding2"><p>${media}</p></td>
        </tr>
    </table>`;
}

export default function generatePDFCurseMonth(data: AssistForMonth): Promise<string> {
    return new Promise((resolve, reject)=>{
        try {
            const nameMonth = listMonths.find((v)=>v.index == parseInt(data.month))?.name;
            const nameFile = `registros-${decode(data.curse).replace('°', '-')}-${nameMonth?.toLowerCase()}`;
            var htmlFinal = getHTML(decode(data.curse), data.age, nameMonth as string, parseInt(data.month), data.result).replace(/\n/gi, '');
            var options: RNHTMLtoPDF.Options = {
                html: htmlFinal,
                fileName: nameFile,
                width: 842,
                height: 595,
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