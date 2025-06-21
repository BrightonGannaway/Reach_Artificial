const express = require('express'); //import exxpress web framework for pages and API
const http = require('http'); //require http protocal
const { Server } = require('socket.io'); //imports socket.io server class for comms
const { Client } = require('ssh2'); //server connection
const path = require('path'); //module for working with file paths


const app = express(); //create express app
const server = http.createServer(app); //create a server using our app
const io = new Server(server); //create a socket server using http server

//use our files within our public folder (all html, css, json, etc.)
app.use(express.static(path.join(__dirname, 'public')));

//actions that happen upon client connection to our socket
io.on('connection', (socket) => {
    //creates a new client connection sets up as null to persist as a variable everywhere
    let conn = null;

    //listen for ssh-connect from client and get details
    socket.on('ssh-connect', ({host, port, username, password}) => {
        //attempting to now connect to ssh server
        if (conn) {
            conn.end();
        }

        conn = new Client();

        conn
        
        .on('ready', () => {
            //notify the client that connection has been establsihed
            socket.emit('data', '*** SSH CONNECTION ESTABLISHED ***\n');
            // start a shell session - interactive
            conn.shell((err, stream) => {
                if (err) return socket.emit('data', `Error: ${err.message}`);
                //upon client keyboard input, forward it to remote shell
                socket.on('input', (data) => {
                    stream.write(data); //send input to ssh
                });

                //upon remote shell output, send to client
                stream.on('data', (data) => {
                    socket.emit('data', data.toString()); //emit buffer string
                });

                stream.on('close', () => {
                    socket.emit('data',  '*** SSH CONNECTION CLOSED ***\n');
                    conn.end();
                });


            });
        })

        .on('error', (err) => {
            socket.emit('data', `SSH Error: ${err.message}\n`);
        })
        //start our ssh connection using credntials received on ssh-connect
        .connect({host, port, username, password});

    });

    //good to keep a case on disconnect to safely end things
    socket.on('disconnect', () => {
        socket.emit('*** SSH SESSION TERMINATED ***\n');
        conn.end();
    })

    socket.on('ssh-disconnect', () => {
        conn.end();
        conn = null;
        socket.emit('*** SSH PROCESS TERMINATED BY CLIENT ***')
    })

});

server.listen(8080, () => {
    console.log('server listening on http://localhost:8080');
});



