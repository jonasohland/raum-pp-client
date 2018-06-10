const Logger = require('./logger');
const Shout = require('./shout');

global.consoleLevel = 'silly';

const send_ip = process.argv[2];


log = new Logger();

sh =  new Shout();

log.info('hello');
