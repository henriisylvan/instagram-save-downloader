const CryptoJS = require('crypto-js');

const interface = require('./interface/interfaces');

const { JsonHandler } = require('./utils');

const SECRET_KEY = Buffer.from(Math.PI.toString()).toString('base64');

const credentials = new JsonHandler('./settings/credentials.json', {});

const changeCredentials = async (options = { force: false }) => {
    const preRequisitesToAsk = options.force || !credentials.obj.username || !credentials.obj.password;

    const changeCredentialsBool = preRequisitesToAsk || await interface.askChangeCredentials(credentials.obj.username); 

    if (changeCredentialsBool) {
        credentials.obj = await interface.getCredentialsInput(preRequisitesToAsk);

        credentials.obj.password = CryptoJS.AES.encrypt(credentials.obj.password, SECRET_KEY).toString();

        credentials.save();
    };

    return changeCredentialsBool;
};

const getCredentials = () => ({ 
    username: credentials.obj.username, 
    password: CryptoJS.AES.decrypt(credentials.obj.password, SECRET_KEY).toString(CryptoJS.enc.Utf8)
});

module.exports = {
    changeCredentials,
    getCredentials
};