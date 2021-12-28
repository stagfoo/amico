import { reducer } from "obake.js";

export type Chat = {
  username: string,
  message: string
}
export type State = {
  currentPage: {
    name: string;
    activePage: { Home: string; "Example Fetch": string };
  };
  username: string,
  player: any,
  container: any,
  controls: any,
  otherPlayers: any,
  socket: any,
  connected: boolean,
  typing: boolean,
  lastTypingTime: number,
  currentPlayerTyping: boolean,
  camera: any,
  scene: any,
  renderer: any,
  currentChat: string,
  orbitcontrols: any,
  chatlog: Array<Chat>
};

export const defaultState = {
  currentPage: { name: "HOME", activePage: "/" },
  username: "player1",
  player: undefined,
  container: undefined,
  controls: undefined,
  otherPlayers: {},
  socket: undefined,
  connected: false,
  typing: false,
  lastTypingTime: 0,
  currentPlayerTyping: false,
  camera: undefined,
  scene: undefined,
  renderer: undefined,
  orbitcontrols: undefined,
  currentChat: "",
  chatlog: []
};

export const routes: any = {
  Home: "/",
  "Example Fetch": "/example-fetch",
};

export const activePage: any = {
  HOME: "/",
  EXAMPLE_FETCH: "/example-fetch",
};
export const reducers = {
  updateCurrentPage: reducer(
    (state: State, value: "HOME" | "EXAMPLE_FETCH" | "GAME") => {
      state.currentPage = { name: value, activePage: activePage[value] };
    }
  ),
  updateTyping: reducer((state: State, value: boolean) => {
    //cant i just check if currentChat is empty
    state.currentPlayerTyping = value;
  }),
  updateOrbitcontrols: reducer((state: State, value: any) => {
    state.orbitcontrols = value;
  }),
  updateConnected: reducer((state: State, value: boolean) => {
    state.connected = value;
  }),
  updateUsername: reducer((state: State, value: string) => {
    state.username = value;
  }),
  updateScene: reducer((state: State, value: string) => {
    state.scene = value;
  }),
  updateCamera: reducer((state: State, value: string) => {
    state.camera = value;
  }),
  updateCurrentPlayer: reducer((state: State, value: any) => {
    state.player = value;
  }),
  updateCurrentChat: reducer((state: State, value: any) => {
    state.currentChat = value;
  }),
  updateChatlog: reducer((state: State, value: any) => {
    state.chatlog.push(value);
  }),
  saveSocket: reducer((state: State, value: any) => {
    state.socket = value
  }),
  addOtherPlayer: reducer((state: State, value: any) => {
    state.otherPlayers[value.id] = value.player
  }),

};
