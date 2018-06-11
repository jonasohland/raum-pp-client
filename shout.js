const Logger = require('./logger');
const EventEmitter = require('events').EventEmitter;
const dgram = require('dgram');
const Netmask = require('netmask').Netmask;
const internalIP = require('internal-ip');
const request = require('request');
const os = require('os');

class Shout extends EventEmitter {
    constructor(name){
        super();
        
        if(name != undefined){
            this.name = name
        } else {
            this.name = os.hostname();

        }

        this.log = new Logger({
            modulePrefix : '[SHOUT]',
        });

        this.intip = internalIP.v4.sync();
        this.cidr = this.intip.concat('/24');
        this.ipblock = new Netmask(this.cidr);

        this.log.note(`my ip is ${this.cidr}`);

        this.shoutIp = this.ipblock.broadcast;

        this.shouter = dgram.createSocket('udp4');

        this.shouter.on('error', (err) => {
            this.log.error(err);
        });


        // from Server <--
        this.shouter.on('message', (mess, rinfo) => {
            let input = parseUdpPacket(mess);
            this.log.note(`received Message from ${rinfo.address}, Message: ${input}`);
            
            //server connection timeout reset
            if(input === 'server'){
                if(this.server.status === 'tmt'){
                    log.note('reconnected to server');
                    this.server.status = 'online';
                }
                this.server.tmt.refresh();
                this.shoutIp = rinfo.address;
            } else if (input.slice(0, 4) === 'data'){
                this.emit('data', mess);
            }

        });

        this.shouter.bind(10011, () => {
            this.shouter.setBroadcast(true);
            this.startShouting();
        });

        this.server = {
            status: 'tmt',
            tmt: setTimeout(() => {
                this.server.status = 'tmt';
                this.log.warn('server has timed out');
                this.shoutIp = this.ipblock.broadcast;
            }, 5000),
        }

    }   
    // to server -->
    shout(mess){
        let out = Buffer.from(mess);
        this.shouter.send(out, 10001, this.shoutIp, () => {
            this.log.silly(`shouted ${mess} on ${this.shoutIp}:10001`);
        });
    }
    // to server -->
    shoutBuffer(buf){
        this.shouter.send(buf, 10001, this.shoutIp, (err, bytes) => {
            if(err) return this.log.error(err);
            this.log.info(`Shoutet ${bytes} bytes of Buffer`);
        })
    }
    // discovery message -->
    startShouting(){
        const _this = this;
        const interval = setInterval(() => {
            _this.shout('discover ' + this.name);
        }, 700);
        return interval;
    }
}

module.exports = Shout;

function parseUdpPacket(message){
    let numbers = [];
    for(const b of message){
        numbers.push(b);
    } 

    return String.fromCharCode(...numbers);

}