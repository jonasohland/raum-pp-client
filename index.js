const Logger = require('./logger');
const Shout = require('./shout');
const FProcess = require('./fileprocessor');
const LocalUdp = require('./localUdp');
global.consoleLevel = 'note';

const send_ip = process.argv[2];


log = new Logger();

//server communication
sh =  new Shout();

//PureData communication
loc = new LocalUdp(sh);

//FileProcessor
watch = new FProcess(sh);

// --> Bridge to PureData
sh.on('data', (data) => {
    loc.sendData(data);
});