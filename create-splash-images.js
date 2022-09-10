const shell = require('shelljs');

const command = `yarn react-native generate-bootsplash
    assets/bootsplash_logo_original.png
    --background-color=FFFFFF
    --logo-width=100
    --assets-path=assets
    --flavor=main`;

(async()=>{
    await shell.execute(command.replace(/\n/gi, ' '));
    console.log("##### Generacion Finalizada #####");
})();