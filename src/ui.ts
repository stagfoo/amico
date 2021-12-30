import html from 'nanohtml';
import { Chat, State } from './domain/store';
import * as ACTIONS from './domain/actions'

export function AppRoot(state: State) {
  return html`
  <div id="app">
        ${routing(state)}
    </div>
  `
}

export function routing(state: State) {
  switch (state.currentPage.name) {
    case "HOME":
      return html`
        <section class="container circle">
        <header>
        <h1>Amico</h1>
        <h3>seperate together</h3>
        </header>
        <div>
          ${usernameInput(state)}
          ${nextButton(state)}
          </div>
        </section>
      `
    case "GAME":
    return html`
    <video muted id="dash" controls></video>
    ${chatUI(state)}
  `
  case "PLAYER_SELECT":
    return html`
      <div class="container circle">
      <h2>Select a Peep</h2>
        ${nextButton(state)}
      </div>
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
  return html`<li><b>${item.username}:</b> <span>${item.message}</span></li>`
}

function chatInput(state: State){
  return html`<input 
    class="chat-input"
    placeholder="say something..."
    value=${state.currentChat}
    onkeyup=${ACTIONS.handleOnChatInput}
  />`
}
function nextButton(state: State){
  return html`<button 
    class="button next"
    onclick=${ACTIONS.handleNextButton}
  > ${'next'} </button>`
}
function usernameInput(state: State){
  return html`<input 
    class="username-input"
    placeholder="what is your disply name"
    value=${state.username}
    onkeyup=${ACTIONS.handleOnUsernameInput}
  />`
}

function chatUI(state: State){
  return html`<div id="chat-ui">${chatlog(state.chatlog)}${chatInput(state)}</div>`
}
//---------------------------------------------------------------