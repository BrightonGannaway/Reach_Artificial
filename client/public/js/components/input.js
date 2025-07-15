// File for the input <textarea> field.
// This file manages the commands sent to the server by the client 
import { socket } from "./../app.js";
import { input } from "./../app.js";

//FIXME - does not properly reset enters
input.onkeydown = (function(e) {
    if ((e.key === 'Enter' || e.keyCode === 13) && (input.value != "")) {
        // "\n" allows input to be entered and run in terminal.
        socket.emit('input', input.value + '\n');
        input.value = "";
    }
})

