import { state } from '..';
import * as ACTIONS from '../domain/actions'

export function initSocket(
  socket: {
    on: (
      arg0: string,
      arg1: {
        (data: { username: string; numUsers: number }): void;
        (data: any): void;
        (data: any): void;
      }
    ) => void;
  }
) {
  if(socket){
    state._update('saveSocket', socket);
    socket.on("user left", ACTIONS.socketOnUserLeft);
    socket.on("typing", ACTIONS.setCurrentPlayerTyping);
    socket.on("stop typing", ACTIONS.removeCurrentPlayerTyping);
    socket.on("new message", ACTIONS.socketOnNewMessage);
    socket.on("player moved", ACTIONS.socketOnPlayerMoved);
    socket.on("user joined", ACTIONS.socketOnUserJoined);
    socket.on("login", ACTIONS.socketOnLogin);
  } else {
    console.log('No Client socket provided')
  }
}
