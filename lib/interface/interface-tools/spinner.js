const Spin = require('spinnies');

const clocks = [ "🕛", "🕐", "🕑", "🕒", "🕓", "🕔", "🕕", "🕖", "🕗", "🕘", "🕙", "🕚" ];

const spinner = { 
    "interval": 120,
    "frames": clocks.map(clock => ` >>> [${clock}]`)
};

const spins = new Spin({
    color: 'yellowBright',
    succeedColor: 'green',
    succeedPrefix: ' >>>',
    failColor: 'red',
    failPrefix: ' >>>',
    spinnerColor: 'blue',
    spinner
});

const start = (id, text, options = {}) => spins.add(id, {text: text, ...options});

const success = (id, text, options = {}) => spins.succeed(id, {text: text, ...options});

const close = (id, text, options = {}) => spins.fail(id, {text: text, ...options});

const update = (id, text, options = {}) => spins.update(id, {text: text, ...options});

module.exports = {
    start,
    success,
    close,
    update
};