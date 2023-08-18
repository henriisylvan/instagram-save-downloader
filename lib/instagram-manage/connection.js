const IgApiClient = require('instagram-private-api');

const { sessionExists, loadSession, saveSession, deleteSession } = require('./session');
const { colorStr } = require('../interface/interface-tools/colors');
const { getCredentials } = require('../credentials-handler');
const interface = require('../interface/interfaces');

const client = new IgApiClient.IgApiClient();

const connect = async (credentialsChanged = false) => {
    try {
        const credentials = getCredentials();
        
        client.state.generateDevice(credentials.username);
        
        await client.simulate.preLoginFlow().catch(() => {});

        client.request.end$.subscribe(async () => {
            const serialized = await client.state.serialize();
            delete serialized.constants;
            saveSession(serialized);
        });

        if (!credentialsChanged && sessionExists()) {
            await client.state.deserialize(loadSession());
        } else {
            await client.account.login(credentials.username, credentials.password);
        };

        process.nextTick(async () => client.simulate.postLoginFlow().catch(() => {}));

        if (!client.state.authorization)
            return await connect(true);

        await client.account.currentUser();

        console.log(colorStr('\n >>> Logged in', 'green'));
    } catch (error) {
        if (error.name == 'IgCheckpointError') {
            await client.challenge.auto(true);
            
            while (true)
                try {
                    const code = await interface.checkpointCodeRequest();
                    
                    await client.challenge.sendSecurityCode(code);

                    console.log(colorStr('\n >>> Correct Code', 'green'));

                    break;
                } catch (err) {
                    console.log(colorStr('\n >>> Incorrect Code', 'red'));
                };

            return await connect(credentialsChanged);
        } else if (error.name == 'IgLoginRequiredError') {
            return await connect(true);
        } else throw error;
    };
};

module.exports = {
    client,
    connect
};