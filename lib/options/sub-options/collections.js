const interface = require('../../interface/interfaces');
const collectionsHandler = require('../../collections-handler');

const optionsRunner = require('../options-runner');

const { colorStr } = require('../../interface/interface-tools/colors');

const OPTIONS = [
    {
        value: `Add collections`,
        description: 'This option will separate posts by the name of the collection they are in',
        execution: collectionsHandler.addCollections
    },
    {
        value: 'View your collections',
        description: 'Will show your added collections',
        available: collectionsHandler.existsCollections,
        execution: () => interface.viewCollections(collectionsHandler.getCollections())
    },
    {
        value: 'Change all collections',
        description: 'Will delete all collections information to add new ones',
        available: collectionsHandler.existsCollections,
        execution: collectionsHandler.changeCollections
    },
    {
        value: 'Delete all collections',
        description: 'Will delete all collections information',
        available: collectionsHandler.existsCollections,
        execution: collectionsHandler.deleteCollections
    },

    { value: colorStr('Return', 'red') }
];

module.exports = {
    index: 0,
    value: 'Collections options',
    available: () => OPTIONS.filter(option => option.available?.() ?? true).length > 1,
    execution: () => optionsRunner(OPTIONS)
};