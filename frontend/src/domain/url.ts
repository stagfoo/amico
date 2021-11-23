import page from 'page';
import { state } from '../index';
import { init, animate } from '../3d/main'
type Context = {
  params: {
    name?: string;
  };
};

// Handlers
const HOME_PAGE = (ctx: Context, next: any) => {
  state._update('updateCurrentPage', 'HOME');
};
const GAME_PAGE = (ctx: Context, next: any) => {
  state._update('updateCurrentPage', 'GAME');
  setTimeout(() => {
    init();
    animate();
  })
};
// const EXAMPLE_FETCH = (ctx: Context, next: any) => {
//   getData('chum').then(data => {
//     state._update('updateGreeting', data.greeting)
//     state._update('updateCurrentPage', 'EXAMPLE_FETCH')
//     state._update('updateNotification', {
//       text: "Shark data loaded  (´ε｀ )♡",
//       show: true
//     })
//     setTimeout(()=> {
//       state._update('updateNotification', {
//         text: "",
//         show: false
//       })
//     }, 1000)
//   })
// };

// Routes
page('/', HOME_PAGE);
// page('/example-fetch', EXAMPLE_FETCH);
page('/game', GAME_PAGE);


export function startRouters(): void {
  page.start();
}

//Network Call
const API = {
  JSON: window.location.origin
}
export async function getData(name: string) {
  const resp = await fetch(`${API.JSON}/data.json`);
  if (resp.ok) {
    return resp.json();
  } else throw new TypeError('getData response is not Ok');
}