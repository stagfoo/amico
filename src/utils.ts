import { defaultState, State } from './domain/store';

export function hydrateState(key:string = 'chumbucket_storage'){
  if(localStorage.getItem(key)) {
    try {
      const state = JSON.parse((localStorage.getItem(key) as any))
      return state;
    } catch(err) {
      console.warn(err)
      return defaultState
    }
  } else {
    return defaultState
  }
}

export function dehydrateState(store: State, key:string = 'chumbucket_storage') {
  localStorage.setItem(key, JSON.stringify(store))
}