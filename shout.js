const Logger = require('./logger');
const EventEmitter = require('events').EventEmitter;
const dgram = require('dgram');
const Netmask = require('netmask').Netmask;
const internalIP = require('internal-ip');
const request = require('request');
const chalk = require('chalk');
const os = require('os');

const fallbackIP = '127.0.0.1';


class Shout extends EventEmitter {
    constructor(name){
        super();

        if(name != undefined){
            this.name = name
        } else {
            // https://randomuser.me/api/
            request('https://randomuser.me/api/', {json: true, timeout: 1000}, (err, res, body) => {
                if (err) { 
                    this.name = os.hostname();
                    return this.log.error(err); 
                } else {
                    this.name = ''+ body.results[0].login.username;
                    this.log.note('My Name is ' + this.name);
                }
            });

        }

        this.log = new Logger({
            modulePrefix : '[SHOUT]',
        });

        this.intip = internalIP.v4.sync();
        this.cidr = this.intip.concat('/24');
        this.ipblock = new Netmask(this.cidr);
        this.log.note(`my ip is ${this.cidr}`);

        this.shouter = dgram.createSocket('udp4');
        this.shouter.on('error', (err) => {
            this.log.error(err);
        });
        this.shouter.on('message', (mess, rinfo) => {
            this.log.note(`received Message from ${rinfo.address}`);
        });
        this.shouter.bind(10005, () => {
            this.shouter.setBroadcast(true);
            this.startShouting();
        });

    }   

    shout(mess){
        let out = Buffer.from(mess);
        this.shouter.send(out, 10001, this.ipblock.broadcast, () => {
            this.log.silly(`shouted ${chalk.green(mess)} on ${this.ipblock.broadcast}:10001`);
        });
    }

    startShouting(){
        const _this = this;
        const interval = setInterval(() => {
            _this.shout('discover ' + this.name);
        }, 700);
        return interval;
    }
}

module.exports = Shout;