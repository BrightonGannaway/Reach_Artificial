
const socket = io(); //connect to server side socket 
const input = document.getElementById('sentCommands')
        
        let isConnectionButtonClicked = false;

        // called when user clicks connect with custom emit of ssh-connect
        function connectSSH() {
            console.log("Tried to connect");
            if (!isConnectionButtonClicked) {
                socket.emit('ssh-connect', {
                    host: document.getElementById('host').value,
                    port: Number(document.getElementById('port').value),
                    username: document.getElementById('username').value,
                    password: document.getElementById('password').value,
                });
            }

            isConnectionButtonClicked = true;
            document.getElementById("sentCommands").removeAttribute('disabled'); //diable to permit more dynamic typing later on
        }

        //FIXME: Client side seems to not be receiving this
        socket.on('client-prompting', (PermitPrompting) => {
            const sentCommands = document.getElementById("sentCommands");
            if (PermitPrompting === true){
                sentCommands.disabled = false;
            } else {
                sentCommands.disabled = true;
            }
        });

        //when server sends back ssh output
        socket.on('data', function (data) {
            //term.write(data);
            formatted = cleanServerOutput(data)
            renderOutput(formatted);

        });

        function renderOutput(data) {
            const outputContainer = document.getElementById('output');
            const outBlock = document.createElement('div');

            const p = document.createElement('p')
            p.textContent = data;

            outBlock.className = 'output-block';
            outBlock.appendChild(p);
            outputContainer.appendChild(outBlock);

            outputContainer.scrollTop = outputContainer.scrollHeight;
        }

        function cleanServerOutput(text) {
            return text
            // Strip ANSI escape sequences (colors, cursor, paste mode, etc.)
            .replace(/\x1b\[[0-9;?]*[a-zA-Z]/g, '')
            .replace(/\x1b\][0-9]*;[^\x07]*\x07/g, '') // OSC sequences (title changes, etc.)
            .replace(/\x1b=\x1b>/g, '')               // Alternate screen mode in/out
            .replace(/\r/g, '\n')                     // Normalize carriage returns
            .replace(/\x07/g, '')                     // Bell characters
            //.replace(/.\x08/g, '')                    // Backspaces and previous char
        }

        //on certain LLM outputs, new lines are cut off and retyped. This checks for simalar
        //patterns sensitively to ensure greater consistency.

        function removeRedundantOutput(line1, line2) {
            line1
        }

        // term.onData((data) => {
        //     socket.emit('input', data);
        // });

        input.onkeydown = (function(e) {
            if ((e.key === 'Enter' || e.keyCode === 13) && (input.value != "")) {
                // "\n" allows input to be entered and run in terminal.
                socket.emit('input', input.value + '\n');
                input.value = "";
            }
        })

        //called to end the ssh session
        function disconnectSSH() {
            if (isConnectionButtonClicked) {
                socket.emit('ssh-disconnect');
            }

            document.getElementById("sentCommands").setAttribute('disabled');
            isConnectionButtonClicked = false;
        }

        //implementing button logic to only allow one connection




module.exports = {socket, input}