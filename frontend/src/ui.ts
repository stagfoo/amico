import html from 'nanohtml';
import { Chat, State } from './domain/store';
import * as ACTIONS from './domain/actions'

export function AppRoot(state: State) {
  return html`
  <div id="app">
      <div class="page">
        ${routing(state)}
      </div>
    </div>
  `
}

export function routing(state: State) {
  switch (state.currentPage.name) {
    case "HOME":
      return usernameInput(state);
    case "GAME":
    return html`
    <div id="game-container">
      <div id="container"></div>
    </div>
    ${chatUI(state)}
    <video id="dash" data-dashjs-player="" autoplay="false" src="https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd" controls="true"></video>
  `
    case "EXAMPLE_FETCH":
      return html`
      <h1>Fetching no?</h1>
        <textarea>（*＾3＾）/～  </textarea>
    `
    default:
    return html`
       <h1>404 CHUM</h1>
  `
  }
}
//----------------------------chat UI----------------------
function chatlog(log: Array<any>){
  return html`<ul>
    ${log.map(m => chatItem(m))}
  </ul>`
}
function chatItem(item: Chat){
  return html`<li><b>${item.username}</b><span>${item.message}</span></li>`
}

function chatInput(state: State){
  return html`<input 
    class="chat-input"
    placeholder="Type here..."
    value=${state.currentChat}
    onkeyup=${ACTIONS.handleOnChatInput}
  />`
}
function usernameInput(state: State){
  return html`<input 
    class="username-input"
    placeholder="Username here..."
    value=${state.username}
    onkeyup=${ACTIONS.handleOnUsernameInput}
  />`
}

function chatUI(state: State){
  return html`<div id="chat-ui">${chatlog(state.chatlog)}${chatInput(state)}</div>`
}
//---------------------------------------------------------------