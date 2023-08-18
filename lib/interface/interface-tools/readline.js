const Readline = require('readline');
const { colorStr, multiColorStrs } = require('./colors');

const readline = (promptLine, options = { password: false }) => new Promise((resolve) => {
    const rl = new Readline.createInterface(process.stdin, process.stdout);
    
    rl.setPrompt(promptLine);
    rl.prompt();
    
    if (options.password) 
        rl._writeToOutput = input => 
            rl.output.write(['\u0004', '\r', '\n', '\r\n'].includes(input) ? input : 
                (input.length > 1 ? promptLine + '*'.repeat(input.slice(promptLine.length).length) : '*'));

    rl.on('line', (line) => {
        const newLine = line.trim();
        rl.close();
        resolve(newLine);
    });
});

const booleanReadline = async (promptLine, choices = { true: ['y'], false: ['n'] }, options = {}) => {
    const promptArr = [ promptLine, ` [${choices.true[0]}/${choices.false[0]}]: ` ];
    const promptColors = [ 'blue', 'green' ];

    const response = await readline(multiColorStrs(promptArr, promptColors));

    const formatedResponse = options.sensitiveCase ? response : response.toLowerCase();

    if (choices.true.includes(formatedResponse) || choices.false.includes(formatedResponse))
        return choices.true.includes(formatedResponse);

    console.log(colorStr('\n >>> Invalid Option\n', 'red'));

    return await booleanReadline(promptLine, choices, options);
};

const choiceReadline = async (promptLine = '', choices = []) => {
    const promptArr = [
        promptLine + '\n',
        ...choices.flatMap((choice, index) => [ `\n [${index + 1}]`, ` ${choice.value}`, choice.description ? ` (${choice.description})` : '' ]),
        '\n\n> ',
        'Digite o número da sua escolha: '
    ];

    const promptColors = [ 'blue', ...Array(choices.length + 1).fill([ 'green', 'blue', 'gray' ]).flat() ];

    const response = Number(await readline(multiColorStrs(promptArr, promptColors)));

    if (Number.isInteger(response) && response > 0 && response <= choices.length) 
        return response - 1;
        
    console.log(colorStr('\n >>> Invalid Option', 'red'));

    return await choiceReadline(promptLine, choices);
};

module.exports = {
    readline,
    booleanReadline,
    choiceReadline
};