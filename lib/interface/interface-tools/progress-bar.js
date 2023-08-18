const { SingleBar } = require('cli-progress');
const { multiColorStrs } = require('./colors');
const { convertSecondsToTimeFormat } = require('../../utils');

class ProgressBar {
    constructor (name, type) {
        this.bar = new SingleBar({
            format: this.#generateFormatBar(name, type),
            barCompleteChar: '■',
            barIncompleteChar: '□',
            hideCursor: true,
            stopOnComplete: true,
            formatTime: convertSecondsToTimeFormat,
            formatValue: this.#formatValues
        });
    };
    
    start = length => {
        console.log('');
        this.bar.start(length, 0);
    };
    
    stop = () => this.bar.stop();

    increment = () => this.bar.increment();

    #generateFormatBar = (name, type) => multiColorStrs([
        name, ' |[ ', '{bar}', ' ]| ', '{percentage}%', ' | ', type + ': ', '{value}/{total}', ' | ', 'Estimated time: ', '{eta_formatted}', ' | ', 'Duration: ', '{duration_formatted}'
    ], ['green', 'white', 'yellow', 'white', 'red', 'white', 'green', 'red', 'white', 'green', 'red', 'white', 'green', 'red']);

    #formatValues = (value, options, type) => String(value).padStart(type == 'percentage' ? 3 : this.bar.getTotal().toString().length, ' ');
};

module.exports = ProgressBar;