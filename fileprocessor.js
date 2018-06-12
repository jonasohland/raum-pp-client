const fs = require('fs');
const fswatch = require('chokidar');
const Logger = require('./logger');
const EventEmitter = require('events').EventEmitter;

const log = new Logger({
    modulePrefix: '[FSWATCH]',
});

class FileProcessor extends EventEmitter{
    constructor(shout){

        super();
        this.shout = shout;
        this.filestack = [];
        this.recstack = [];
        this.outstack = [];

        //clear directory
        fs.readdir('/Users/jonasohland/raumpp/raum-pp-pd', (err, files) => {
            if(err){
                if(err.code === 'ENOENT') log.error('Dir not found');
                return 0;
            }

            let wavs = []

            files.forEach(file => {
                if(file.slice(-4) === '.wav') {

                    let pathtofile = '/Users/jonasohland/raum-pp-pd/'.concat(file);

                    fs.unlink(pathtofile, (err) => {
                        log.silly(`file ${pathtofile} deleted`);
                        if(err) log.error(err);
                    })
                }
            });

        });
        //start watcher
        this.watch = fswatch.watch('/Users/jonasohland/raum-pp-pd', {
            ignored: /(^|[\/\\])\../,
            ignoreInitial: true,

        }).on('add', (path) => {
            if(path.slice(-4) === '.wav'){
                log.note(`File ${path} added`);
                this.recstack.push(path);
            }
            shout.shout('rec');
                
        }).on('change', (path => {
            if(path.slice(-4) === '.wav'){            
                log.note(`File ${path} changed`);
                if(this.recstack.indexOf(path) !== -1){
                    this.filestack.push(this.recstack[path]);
                    log.note(`pushed ${this.recstack[path]} to filestack`);
                }

            }
                
        }));
    }
}

class RecFile extends EventEmitter{
    constructor(path){
        super();
        this.path = path;
        this.state = rec;
    }
}




module.exports = FileProcessor;