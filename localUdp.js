const EventEmitter = require('events').EventEmitter;
const dgram = require('dgram');
const Logger = require('./logger');

const log = new Logger({
    modulePrefix: '[LOCAL]',
});

class LocalUdp extends EventEmitter {
    constructor(sh){
        super();
        this.localUdp = dgram.createSocket('udp4');
        this.shout = sh;

        //data from PureData <--
        this.localUdp.on('message', (packet) => {
            
            let message = parseUdpPacket(packet);
            log.info('got message: ' + message);
            if(message.slice(0, 4) === 'data'){

                log.info('data ' + message.slice(5));

                // --> Bridge to Server
                this.shout.shoutBuffer(packet);
            }
        });

        this.localUdp.on('listening', () => {
            let serverInfo = this.localUdp.address();
            log.note(`listening on ${serverInfo.address}:${serverInfo.port}`);

        });

        this.localUdp.bind({
            port: 42424,
            address: 'localhost',   
        });

    }
    // bridge to pure data -->
    sendData(buf){
        this.localUdp.send(buf, 42425, (err, bytes) => {
            log.info(`bridged ${bytes} bytes`);
            log.info('content: ' + parseUdpPacket(buf));
        })
    }

}


function parseUdpPacket(message){
    let numbers = [];

    for(const b of message){
        numbers.push(b);
    } 

    return String.fromCharCode(...numbers);

}

module.exports = LocalUdp;