const { JsonHandler } = require('../utils');

const session = new JsonHandler('./settings/session.json');

const sessionExists = () => !!session.obj;

const loadSession = () => session.obj;

const saveSession = (state) => {
    session.obj = state;
    session.save();
};

const deleteSession = () => session.delete();

module.exports = {
    sessionExists,
    loadSession,
    saveSession,
    deleteSession
};