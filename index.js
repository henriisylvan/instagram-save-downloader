process.stderr.isTTY = true;

const credentialsHandler = require('./lib/credentials-handler');
const instagram = require('./lib/instagram-manage/connection');

const rootOptions = require('./lib/options/root-options');

const { colorStr } = require('./lib/interface/interface-tools/colors');

async function start(forceCredentialsChange = false) {
    try {
        const credentialsChanged = await credentialsHandler.changeCredentials({ force: forceCredentialsChange });
        
        await instagram.connect(credentialsChanged);
        
        await rootOptions();
    } catch (error) {
        if (error.name == 'IgLoginBadPasswordError' || error.name == 'IgLoginInvalidUserError') {
            console.log(colorStr('\n >>> Incorrect Username or Password', 'red'));

            return await start(true);
        };
        
        return console.log(colorStr(`\n >>> Error: ${colorStr(error?.stack || error, 'gray')}\n`, 'red'));
    };  
};

start();