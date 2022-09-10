const shell = require('shelljs');
const time = new Date();
const strTime = `${(String(time.getDate()).length == 1)? `0${String(time.getDate())}`: String(time.getDate())}/${(String(time.getMonth()+1).length == 1)? `0${String(time.getMonth()+1)}`: String(time.getMonth()+1)}/${time.getFullYear()} ${(String(time.getHours()).length == 1)? `0${String(time.getHours())}`: String(time.getHours())}:${(String(time.getMinutes()).length == 1)? `0${String(time.getMinutes())}`: String(time.getMinutes())}hs`;

function execute(command) {
    return new Promise((resolve, reject)=>{
        const request = shell.exec(command);
        if (request.code !== 0) {
            console.error(request.stderr);
            shell.exit(1);
            reject();
        } else {
            console.log(request.stderr);
            resolve();
        }
    });    
}

async function init() {
    try {
        await execute('git add .');
        await execute(`git commit -m "${strTime}"`);
        await execute('git push -u origin main');
        console.log('##### Sincronizacion finalizada #####');
    } catch {
        console.error('Oparacion detenida: Ocurrio un error.');
    }
}

init();