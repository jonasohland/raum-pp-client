const fs = require('fs');
const fswatch = require('chokidar');
const Logger = require('./logger');
const EventEmitter = require('events').EventEmitter;
const Lame = require('node-lame').Lame;
const request = require('request');

const homepath = '/Users/jonasohland/raum-pp-pd';


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
        fs.readdir(homepath, (err, files) => {
            if(err){
                if(err.code === 'ENOENT') log.error('Dir not found');
                return 0;
            }

            let wavs = []

            files.forEach(file => {
                if(file.slice(-4) === '.wav' || file.slice(-4) === '.mp3') {

                    let pathtofile = (homepath + '/').concat(file);

                    fs.unlink(pathtofile, (err) => {
                        if(err) return log.error(err);
                        log.note(`file ${pathtofile} deleted`);
                    })
                }
            });

        });
        //start watcher
        this.watch = fswatch.watch(homepath, {
            ignored: /(^|[\/\\])\../,
            ignoreInitial: true,

        }).on('add', (path) => {
            if(path.slice(-4) === '.wav'){
                this.recstack.push(path);
                log.note(`pushed ${path} to recstack`);
                shout.shout('recording');
            }
            
                
        }).on('change', (path => {
            if(path.slice(-4) === '.wav'){    

                let rstackindex = this.recstack.indexOf(path); 

                if(rstackindex !== -1){

                    //move from rec to filestack
                    this.filestack.push(this.recstack[rstackindex]);
                    log.note(`pushed ${this.recstack[rstackindex]} to filestack`);
                    this.recstack.splice(rstackindex, 1);
                    shout.shout('recorded');
                    //encode
                    let fstackindex = this.filestack.indexOf(path);

                    let targetfile = this.filestack[fstackindex].slice(0, -4).concat('.mp3');

                    const encoder = new Lame({
                        'output': targetfile,
                        'bitrate': 128,
                    }).setFile(this.filestack[fstackindex]);

                    encoder.encode()
                        .then(() => {
                            log.note('encoded -> ' + targetfile);
                            
                            fs.unlink(this.filestack[fstackindex], (err) => {
                                if(err) return log.error(err);
                                this.filestack.splice(fstackindex, 1);
                            })
                
                            let form = {
                                file: fs.createReadStream(targetfile)
                            }
                            log.note({url: `http://${shout.shoutIp}:10080/new`, formData: form});
                            request.post({url: `http://${shout.shoutIp}:10080/new`, formData: form}, (err, head, body) => {
                                if(err) return log.error(err);

                                log.note(head);
                                log.note(body);

                            });

                            
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