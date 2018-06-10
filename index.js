const Logger = require('./logger');
const Shout = require('./shout');
const Watch = require('./filewatch');

global.consoleLevel = 'info';

const send_ip = process.argv[2];


log = new Logger();

sh =  new Shout();

watch = new Watch(sh);

