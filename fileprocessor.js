const fs = require('fs');
const fswatch = require('chokidar');
const Logger = require('./logger');
const EventEmitter = require('events').EventEmitter;
const Lame = require('node-lame').Lame;

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
        fs.readdir('/Users/jonasohland/raum-pp-pd', (err, files) => {
            if(err){
                if(err.code === 'ENOENT') log.error('Dir not found');
                return 0;
            }

            let wavs = []

            files.forEach(file => {
                if(file.slice(-4) === '.wav') {

                    let pathtofile = '/Users/jonasohland/raum-pp-pd/'.concat(file);

                    fs.unlink(pathtofile, (err) => {
                        if(err) return log.error(err);
                        log.note(`file ${pathtofile} deleted`);
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
                this.recstack.push(path);
                log.note(`pushed ${path} to recstack`);
            }
            shout.shout('rec');
                
        }).on('change', (path => {
            if(path.slice(-4) === '.wav'){    

                log.note(`File ${path} changed`);
                let rstackindex = this.recstack.indexOf(path); 

                if(rstackindex !== -1){

                    //move from rec to filestack
                    this.filestack.push(this.recstack[rstackindex]);
                    log.note(`pushed ${this.recstack[rstackindex]} to filestack`);
                    this.recstack.splice(rstackindex, 1);

                    //encode
                    let fstackindex = this.filestack.indexOf(path);

                    let targetfile = this.filestack[fstackindex].slice(0, -4).concat('.mp3');
                    log.note(targetfile);
                    const encoder = new Lame({
                        'output': targetfile,
                        'bitrate': 128,
                    }).setFile(this.filestack[fstackindex]);

                    enoder.encode()
                        .then(() => {
                            log.note('encoded -> ' + targetfile);
                        })
                        .catch((error) => {
                            log.error(error);
                        });

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