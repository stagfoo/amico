import * as THREE from "three";
import * as _ from "lodash";
import { PlayerControls } from "./playerControl";
import { CanvasTexture } from "three";
import { typingBubble } from '../3d/chat/bubbles';
import { state } from '../index';
//TODO move to canvas section
function makeLabelCanvas(baseWidth: number, size: number, name: string) {
  const domElm = document.createElement("canvas");
  const ctx = domElm.getContext("2d");
  const font = `${size}px bold sans-serif`;
  if (ctx) {
    ctx.font = font;
    const width = baseWidth;
    const height = 50;
    // measure how long the name will be
    ctx.canvas.width = width;
    ctx.canvas.height = height;
    // need to set font again after resizing canvas
    ctx.font = font;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);

    // scale to fit but don't stretch
    ctx.translate(width / 2, height / 2);
    ctx.scale(1, 1);
    ctx.fillStyle = "white";
    ctx.fillText(name, 0, 0);
    document.body.appendChild(domElm);
    return new THREE.CanvasTexture(ctx.canvas);
  }
  console.log("makeLabelCanvas");
  return;
}

// --------------Mesh Loader-----------------------
let loader = new THREE.BufferGeometryLoader();
// --------------Material-----------------------
const peep_tex = new THREE.TextureLoader().load('/textures/peep.png');
const peep_material = new THREE.MeshToonMaterial();
peep_material.emissiveMap = peep_tex;
peep_material.emissive = new THREE.Color(1, 1, 1);


export class Player {
  username: any;
  isMainPlayer: boolean = false;
  mesh?: any;
  scene: any;
  controls: any;
  camera: any;
  container: any
  socket: any
  orbitcontrols: any
  constructor(username: string, container: any, socket: any, orbitcontrols:any) {
    this.username = username;
    this.container = container
    this.socket = socket
    this.orbitcontrols = orbitcontrols
  }
  init =  () => {
    const scope = this;
    const { username } = this;

    loader.load("/mesh/peep_one.json" as unknown as string, function (geometry: any) {
      try {
        const usernameTexture = makeLabelCanvas(
          username.length * 20,
          24,
          username
        ) as CanvasTexture;
        scope.mesh = new THREE.Mesh(geometry, peep_material);
        scope.mesh.scale.set(0.5, 0.5, 0.5);
        scope.mesh.rotateY(0);
        typingBubble(scope.mesh, usernameTexture);
        state.scene.add(scope.mesh);
        
        if (scope.isMainPlayer) {
          scope.mesh.add(state.camera);
          scope.controls = new PlayerControls(state.camera, scope.mesh, scope.container, scope.socket, scope.orbitcontrols);
          scope.controls.init();
        }
      } catch(e) {
        console.log(e);
      }

    });
    console.log("Loading Peep Mesh...");
    return;
  };
  setOrientation = (orientation: { position: any }) => {
    const scope = this;
    if (scope.mesh) {
      scope.mesh.position.copy(orientation.position);
    }
  };
}
