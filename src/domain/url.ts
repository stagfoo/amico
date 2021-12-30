import page from 'page';
import { state } from '../index';
import { init, animate } from '../3d/main'
import { loadDashVideo } from '../video';

// Handlers
const HOME_PAGE = () => {
  state._update('updateCurrentPage', 'HOME');
};
const GAME_PAGE = () => {
  state._update('updateCurrentPage', 'GAME');
  setTimeout(() => {
    loadDashVideo();
    init();
    animate();
  })
};
const PLAYER_SELECT = () => {
  state._update('updateCurrentPage', 'PLAYER_SELECT');
};

// Routes
page('/', HOME_PAGE);
page('/game', GAME_PAGE);
page('/player-select', PLAYER_SELECT);


export function startRouters(): void {
  page.start();
}