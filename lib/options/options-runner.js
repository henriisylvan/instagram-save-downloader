const interface = require('../interface/interfaces');

const { sleep } = require('../utils');

const optionsRunner = async options => {
    await sleep(1800);
    
    const availableOptions = options.filter(option => option.available?.() ?? true);

    const choiceIndex = await interface.runOptionsChoice(availableOptions);

    await availableOptions[choiceIndex].execution?.();
    
    if (choiceIndex != availableOptions.length - 1) 
        return await optionsRunner(options);
};

module.exports = optionsRunner;