const express = require('express');
const ws = require('ws');

const app = express();

let sockets = [];
let lastTime = Number(new Date().getTime());

const wsServer = new ws.Server({ noServer: true });
wsServer.on('connection', socket => {
    sockets.push(socket);

    socket.send(lastTime);
    
    socket.on('message', message => {
        lastTime = Number(new Date().getTime());

        console.log(`new time is: ${new Date(lastTime).toString()}`);
        
        for (let i = 0; i < sockets.length; i++) {
            if (sockets[i]._readyState > 1) {
                console.log('oh noes is ded!')
                sockets.splice(i,1); //yeets socket
                continue;
            }

            sockets[i].send(lastTime);
        }
        
    });
});

app.get('/', (req, res) => {
    res.send(`There are currently ${sockets.length} client(s) connected`)
});

app.post('/', (req, res) => {
    lastTime = Number(new Date().getTime());
    res.send(lastTime)
});

const server = app.listen(3000);

server.on('upgrade', (request, socket, head) => {
    wsServer.handleUpgrade(request, socket, head, socket => {
        wsServer.emit('connection', socket, request);
    });
});