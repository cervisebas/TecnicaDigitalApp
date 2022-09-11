const shell = require('shelljs');

const command = `yarn react-native generate-bootsplash
    assets/bootsplash_logo_original.png
    --background-color=FFFFFF
    --logo-width=100
    --assets-path=assets
    --flavor=main`;
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

(async()=>{
    await execute(command.replace(/\n/gi, ' '));
    console.log("##### Generacion Finalizada #####");
})();