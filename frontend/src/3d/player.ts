import * as THREE from "three";
import * as _ from "lodash";
import { PlayerControls } from "./playerControl";
import peepPNG from "../../textures/texture.png";
import peepMESH from "../../mesh/peep_one.json";
import { CanvasTexture } from "three";

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
const peep_tex = new THREE.TextureLoader().load(peepPNG);
const peep_material = new THREE.MeshToonMaterial();
peep_material.emissiveMap = peep_tex;
peep_material.emissive = new THREE.Color(1, 1, 1);

export const Player: any = function (
  this: {
    playerID: any;
    isMainPlayer: boolean;
    mesh?: any;
    init?: any;
    setOrientation?: any;
  },
  playerID: string,
  scene: any,
  camera: any,
  controls: any
) {
  this.playerID = playerID;
  this.isMainPlayer = false;
  this.mesh;

  let scope = this;
  this.init = function () {
    loader.load(peepMESH as unknown as string, function (geometry: any) {
      const usernameTexture = makeLabelCanvas(
        playerID.length * 20,
        24,
        playerID
      ) as CanvasTexture;
      scope.mesh = new THREE.Mesh(geometry, peep_material);
      scope.mesh.scale.set(0.5, 0.5, 0.5);
      scope.mesh.rotateY(-180);
      typingBubble(scope.mesh, usernameTexture);
      scene.add(scope.mesh);

      if (scope.isMainPlayer) {
        controls = new PlayerControls(camera, scope.mesh);
        controls.init();
      }
    });
    console.log("Loading Peep Mesh...");
    return;
  };
  this.setOrientation = function (orientation: { position: any }) {
    if (scope.mesh) {
      scope.mesh.position.copy(orientation.position);
      //   scope.mesh.rotation.x = rotation.x;
      //   scope.mesh.rotation.y = rotation.y;
      //   scope.mesh.rotation.z = rotation.z;
    }
  };
};
