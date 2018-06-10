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

        //clear directory
        fs.readdir('/Users/jonasohland/raum-pp-pd', (err, files) => {
            if(err) return log.error(err)

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
            }
            shout.shout('rec');
                
        }).on('change', (path => {
            if(path.slice(-4) === '.wav'){            
                log.note(`File ${path} changed`);
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