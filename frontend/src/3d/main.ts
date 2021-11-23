import * as THREE from "three";
import * as _ from "lodash";
import * as ACTIONS from '../domain/actions'
import { state } from '../index'

let camera: THREE.PerspectiveCamera,
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer;

export function init() {
  // Setup

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
  let videoSprite = new THREE.Sprite(createVideoTexture("dash-video"));
  videoSprite.position.y = 1;
  videoSprite.position.z = 1;
  videoSprite.position.x = 1;
  videoSprite.scale.set(1, 1, 1);
  scene.add(videoSprite);
  console.log("added");
  renderer.setSize(window.innerWidth, window.innerHeight);
  // Events
  window.addEventListener("resize", onWindowResize, false);
  ACTIONS.setCurrentPlayer(io(), scene, camera);
  document.querySelector('#container')?.appendChild(renderer.domElement);
}

export function animate() {
  requestAnimationFrame(animate);

  if (state.player.controls) {
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










