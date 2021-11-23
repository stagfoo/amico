import { state } from "../index";
import { Player } from "../3d/player";
import page from 'page';

export function setUsername(username: string) {
  state._update("updateUsername", username);
}
export function setConnected(connected: boolean) {
  state._update("updateConnected", connected);
}
export function setCurrentPlayerTyping() {
  state._update("updateTyping", true);
}

export function handleOnChatInput(event: any) {
  const elm: any = event.target;
  //better naming for enter key
  if(event.which === 13){
    state._update("updateChatlog", {
      username: state.username,
      message: state.currentChat
    });
    state._update("updateCurrentChat", "");
    elm.value = "";
  }
  state._update("updateCurrentChat", elm?.value);
  if(state.currentChat.length > 0){
    state._update("updateTyping", true);
  } else {
    state._update("updateTyping", false);
  }
}

export function handleOnUsernameInput(event: any){
  const elm: any = event.target;
  state._update("updateUsername", elm?.value);
  if(event.which === 13){
    page('/game')
  }
}

export function removeCurrentPlayerTyping(data: any) {
  state._update("updateTyping", false);
}


export function setCurrentPlayer(socket: any) {
  if (state.username) {
    let player = new Player(state.username);
    player.isMainPlayer = true;
    player.init();
    // Tell other clients a new user joined
    state._update("updateCurrentPlayer", player);
    socket.emit("add user", {
      username: state.username,
      orientation: {},
    });
  }
}

export function socketOnNewMessage(data: any) {
  state._update("addNewChatMessage", data);
}
export function socketOnLogin(data: any) {
  state._update("updateConnected", true);
  console.log("Welcome to Socket.IO Chat – " + data.username);
  //TODO welcome message?
  Object.keys(state.otherPlayers).map((k) => {
    console.log("login", data);
    if (!Object.keys(data.currentUsers).includes(k)) {
      state._update("addOtherPlayer", {
        id: k,
        player: new Player(k),
      });
      state.otherPlayers[k].init();
    }
  });
}
export function socketOnPlayerMoved(data: any) {
  const otherPlayers = state.otherPlayers;
  if (!Object.keys(otherPlayers).includes(data.username)) {
    otherPlayers[data.username] = new Player(data.username);
    otherPlayers[data.username].init();
  }
  console.log(otherPlayers);
  if (data.orientation && data.username) {
    otherPlayers[data.username].setOrientation(data.orientation);
  }
}
export function socketOnUserLeft(data: any) {
  console.log("User left " + data.username);
  //TODO remove otherPlayer
}
export function socketOnUserJoined(
  data: any,
) {
  if (state.username != data.username && !state.otherPlayers[data.username]) {
    state._update("addOtherPlayer", {
      id: data.username,
      player: new Player(data.username),
    });
    state.otherPlayers[data.username].init();
  }
}
