const Logger = require('./logger');
const Shout = require('./shout');
const FProcess = require('./fileprocessor');

global.consoleLevel = 'info';

const send_ip = process.argv[2];


log = new Logger();
sh =  new Shout();

watch = new FProcess(sh);

