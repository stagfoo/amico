
   
import { reducers, State } from './domain/store';
import { startRouters } from './domain/url';
import { hydrateState } from './utils'
import { createStore } from 'obake.js';
import { AppRoot } from './ui';
import { initSocket } from './domain/socket';
import { BaseStyles, IntroWizard, UIStyles  } from './styles';
import morph from 'nanomorph';

//Default render
const ROOT_NODE = document.body.querySelector('#app');

//Create Store
const defaultState = hydrateState()
export const state = createStore(
    defaultState,
    {
      renderer
    },
    reducers
  );

//Render Loop function
function renderer(newState: State) {
  morph(ROOT_NODE, AppRoot(newState), {
    onBeforeElUpdated: function(fromEl: { isEqualNode: (arg0: any) => any; }, toEl: any) {
        // spec - https://dom.spec.whatwg.org/#concept-node-equals

        if (fromEl.isEqualNode(toEl)) {
            return false
        }
        return true
    }
  })
}
//Start Router listener
startRouters();
BaseStyles();
IntroWizard();
UIStyles();
if(window['io']){
  initSocket(io());
}

// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//       navigator.serviceWorker.register('./service-worker.js').then(
//           registration => {
//               console.log(`ServiceWorker registration successful with scope: ${registration.scope}`);
//           },
//           error => {
//               console.log(`ServiceWorker registration failed: ${error}`);
//           }
//       );
//   });
// }