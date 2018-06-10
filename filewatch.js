const fswatch = require('chokidar');
const Logger = require('./logger');
const EventEmitter = require('events').EventEmitter;

const log = new Logger({
    modulePrefix: '[FSWATCH]',
});

class FileWatch extends EventEmitter{
    constructor(shout){
        super();
        this.shout = shout;


    }
}



fswatch.watch('/Users/jonasohland/raum-pp-pd', {
    ignored: /(^|[\/\\])\../,
}).on('add', (path) => {
    if(path.slice(-4) === '.wav')
        log.info(`File ${path} added`);
}).on('change', (path => {
    if(path.slice(-4) === '.wav')
        log.info(`File ${path} changed`);
}));

module.exports = FileWatch;