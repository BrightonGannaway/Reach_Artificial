const express = require('express'); //import express web framework for pages and API
const http = require('http'); //import http protocol
const { Server } = require('socket.io'); //import socket.io server class for comms
const { Client } = require('ssh2'); //server connection
const path = require('path'); //module for working with file paths



const app = express(); //create express app
const server = http.createServer(app); //create a server using our app
const io = new Server(server); //create a socket server using http server

//use our files within our public folder (all html, css, json, etc.)
app.use(express.static(path.join(__dirname, '../client/public')));


//export default function attachSocketLogic(io) { //for testing purposes
io.on('connection', (socket) => {
    //creates a new client connection sets up as null to persist as a variable everywhere
    let conn = null;

    //listen for ssh-connect from client and get details
    socket.on('ssh-connect', ({host, port, username, password}) => {
        //attempting to now connect to ssh server
        if (conn) {
            return
        }

        conn = new Client();

        conn
        
        .on('ready', () => {
            //notify the client that connection has been establsihed
            socket.emit('data', '*** SSH CONNECTION ESTABLISHED ***\n');
            socket.emit('client-prompting', true);
            // start a shell session - interactive
            conn.shell((err, stream) => {
                if (err) return socket.emit('data', `Error: ${err.message}`);
                //upon client keyboard input, forward it to remote shell
                socket.on('input', (data) => {
                    stream.write(data); //send input to ssh
                });

                //upon remote shell output, send to client
                let buffer = ''; 
                stream.on('data', (data) => {

                    /**
                     *  A buffer is created (above) to segment text into lines. Received data may be sent 
                     *  in different chuncks. This buffer ensures that chunks are consolidated 
                     *  and are sent out in a clean matter
                     */

                    buffer += data;

                    let newlineI;
                    while ((newlineI = buffer.indexOf('\n')) >= 0) {
                        const line = buffer.slice(0, newlineI + 1);
                        socket.emit('data', line.toString()); //emit buffer string
                        buffer = buffer.slice(newlineI + 1); // buffer refreshes once line is finished and displayed
                    }

                });

                stream.on('close', () => {
                    socket.emit('data',  '*** SSH CONNECTION CLOSED ***\n');
                    socket.emit('client-prompting', false);
                });
                


            });
        })

        .on('error', (err) => {
            socket.emit('data', `SSH Error: ${err.message}\n`);
            socket.emit('client-prompting', false);
        })
        //start our ssh connection using credntials received on ssh-connect
        .connect({host, port, username, password});

    });

    //good to keep a case on disconnect to safely end things
    socket.on('disconnect', () => {
        socket.emit('data', '*** SSH SESSION TERMINATED ***\n');
        socket.emit('client-prompting', false);
        if (conn) {
            conn.end();
        }
    })

    socket.on('ssh-disconnect', () => {
        socket.emit('*** SSH PROCESS TERMINATED BY CLIENT ***');
        socket.emit('client-prompting', false);
        if (conn) {
            conn.end();
        }
        conn = null;
    })

});
//}

server.listen(8080, () => {
    console.log('server listening on http://localhost:8080');
});

//use exports
module.exports = {}

