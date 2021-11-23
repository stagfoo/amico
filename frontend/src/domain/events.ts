let username: string;
let connected: boolean;
let socket: any;
let typing: any;
let player: any;
import { Player } from "../3d/player";

import { sendMessage, updateTyping, cleanInput } from '../chat';

export function bindEventListeners(){
    window.addEventListener("keydown", keydownListener);
    // window.addEventListener("keydown", myScript);
    // window.addEventListener("keydown", myScript);
    // window.addEventListener("keydown", myScript);
    // window.addEventListener("keydown", myScript);
    // window.addEventListener("keydown", myScript);

}

function keydownListener (event: {
    ctrlKey: any;
    metaKey: any;
    altKey: any;
    which: number;
  }) {
    // When the client hits ENTER on their keyboard
    if (event.which === 13) {
      if (username) {
        sendMessage(connected, username, socket);
        socket.emit("stop typing");
        typing = false;
      }
    }
  };



  
  