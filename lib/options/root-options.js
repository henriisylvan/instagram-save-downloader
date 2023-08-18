const optionsRunner = require('./options-runner');
const getSubOptions = require('./get-sub-options');

const { colorStr } = require('../interface/interface-tools/colors');
const { sleep } = require('../utils');

const SUB_OPTIONS = getSubOptions();

const OPTIONS = [
    ...SUB_OPTIONS,

    {
        value: colorStr('Reload', 'red'),
        available: () => process.argv.includes('--loop_execution'),
        execution: async () => {
            console.log(colorStr('\n >>> Reloading...\n', 'green'));
            await sleep(2000);
            process.exit(1);
        }
    },
    {
        value: colorStr('Exit', 'red'),
        execution: async () => {
            console.log(colorStr('\n >>> Leaving...', 'green'));
            await sleep(2000);
            process.exit(0);
        }
    }
];

const runRootOptions = () => optionsRunner(OPTIONS);

module.exports = runRootOptions;