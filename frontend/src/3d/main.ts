import * as THREE from "three";
import OrbitControls from 'three-orbitcontrols';
import * as _ from "lodash";
import * as ACTIONS from '../domain/actions'
import { state } from '../index'

let camera: THREE.PerspectiveCamera,
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer;

export function init() {
  // Setup
  let container = document.querySelector('#container');
  scene = new THREE.Scene();
  let axes = new THREE.AxesHelper(5);
  scene.add(axes);
  let gridXZ = new THREE.GridHelper(100, 10);
  gridXZ.position.set(0, 0, 0);
  scene.add(gridXZ);

  camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer({ alpha: true });
  let videoSprite = new THREE.Sprite(createVideoTexture("dash"));
  videoSprite.position.y = 15;
  videoSprite.position.z = -50;
  videoSprite.position.x = -50;
  videoSprite.scale.set(1.6*30, 1*30, 1*30);
  scene.add(videoSprite);
  console.log("added");
  renderer.setSize(window.innerWidth, window.innerHeight);
  // Events
  window.addEventListener("resize", onWindowResize, false);
  const orbitcontrols = new OrbitControls( camera, renderer.domElement );
  ACTIONS.setCurrentPlayer(window['io'], scene, camera, renderer.domElement, orbitcontrols);
  container?.appendChild(renderer.domElement);

}

export function animate() {
  requestAnimationFrame(animate);

  if (_.get(state, 'player.controls', false)) {
    state.player.controls.update();
  }

  render();
}

function render() {
  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function createVideoTexture(id: string) {
  let video = document.getElementById(id) as HTMLVideoElement;
  if (!_.isNil(video)) {
    let texture = new THREE.VideoTexture(video);
    return new THREE.SpriteMaterial({
      map: texture,
      transparent: false,
    });
  }
  console.log("createVideoTexture " + id);
  return;
}










