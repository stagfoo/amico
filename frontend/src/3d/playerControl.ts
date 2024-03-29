import * as _ from "lodash";
import * as THREE from "three";

type PlayerObj = {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  username?: string;
};
export class PlayerControls {
  player: PlayerObj;
  mesh?: any;
  scene: any;
  controls: any;
  camera: any;
  socket: any;
  domElement: any;
  enabled: any;
  center: any;
  moveSpeed: any;
  turnSpeed: any;
  userZoom: any;
  userZoomSpeed: any;
  userRotate: any;
  userRotateSpeed: any;
  autoRotate: any;
  autoRotateSpeed: any;
  YAutoRotation: any;
  minPolarAngle: any;
  maxPolarAngle: any;
  minDistance: any;
  maxDistance: any;
  EPS: any;
  PIXELS_PER_ROUND: any;

  rotateStart: any;
  rotateEnd: any;
  rotateDelta: any;

  zoomStart: any;
  zoomEnd: any;
  zoomDelta: any;

  phiDelta: any;
  thetaDelta: any;
  scale: any;
  lastPosition: any;
  playerIsMoving: any;

  keyState: any;
  STATE: any;
  state: any;
  orbitcontrols: any;

  constructor(
    camera: any,
    player: any,
    domElement: undefined,
    socket: undefined,
    orbitcontrols: undefined
  ) {
    this.camera = camera;
    this.orbitcontrols = orbitcontrols;
    this.player = player;
    this.socket = socket;
    this.domElement = domElement !== undefined ? domElement : document;
    this.enabled = true;
    this.center = new THREE.Vector3(
      player.position.x,
      player.position.y,
      player.position.z
    );
    this.moveSpeed = 0.2;
    this.turnSpeed = 0.1;
    this.userZoom = true;
    this.userZoomSpeed = 1.0;

    this.userRotate = true;
    this.userRotateSpeed = 1.5;
    this.autoRotate = false;
    this.autoRotateSpeed = 0.1;
    this.YAutoRotation = false;

    this.minPolarAngle = 0;
    this.maxPolarAngle = Math.PI;

    this.minDistance = 0;
    this.maxDistance = Infinity;
    this.EPS = 0.000001;
    this.PIXELS_PER_ROUND = 1800;

    this.rotateStart = new THREE.Vector2();
    this.rotateEnd = new THREE.Vector2();
    this.rotateDelta = new THREE.Vector2();

    this.zoomStart = new THREE.Vector2();
    this.zoomEnd = new THREE.Vector2();
    this.zoomDelta = new THREE.Vector2();

    this.phiDelta = 0;
    this.thetaDelta = 0;
    this.scale = 1;

    this.lastPosition = new THREE.Vector3(
      player.position.x,
      player.position.y,
      player.position.z
    );
    this.playerIsMoving = false;

    this.keyState = {};
    document.addEventListener(
      "keydown",
      (ev: any) => this.onKeyChange(ev, this.keyState, true),
      false
    );
    document.addEventListener(
      "keyup",
      (ev: any) => this.onKeyChange(ev, this.keyState, false),
      false
    );
  }

  init = () => {
    this.camera.position.x = this.player.position.x + 2;
    this.camera.position.y = this.player.position.y + 2;
    this.camera.position.z = this.player.position.x + 2;
    // this.camera.lookAt(this.player.position);
  };

  update = () => {
    this.checkKeyStates();
    this.center = this.player.position;
    let position = this.camera.position;
    let offset = position.clone().sub(this.center);
    let theta = Math.atan2(offset.x, offset.z);

    let phi = Math.atan2(
      Math.sqrt(offset.x * offset.x + offset.z * offset.z),
      offset.y
    );

    theta += this.thetaDelta;
    phi += this.phiDelta;

    // restrict phi to be between desired limits
    phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, phi));

    // restrict phi to be between EPS and PI-EPS
    phi = Math.max(this.EPS, Math.min(Math.PI - this.EPS, phi));

    let radius = offset.length() * this.scale;

    radius = Math.max(this.minDistance, Math.min(this.maxDistance, radius));

    offset.x = radius * Math.sin(phi) * Math.sin(theta);
    offset.y = radius * Math.cos(phi);
    offset.z = radius * Math.sin(phi) * Math.cos(theta);

    this.camera.lookAt(this.center);

    this.thetaDelta = 0;
    this.phiDelta = 0;
    this.scale = 1;

    if (this.lastPosition.distanceTo(this.player.position) > 0) {
      this.lastPosition.copy(this.player.position);
    } else if (this.lastPosition.distanceTo(this.player.position) == 0) {
      this.playerIsMoving = false;
    }
  };

  faceDown = () => {
    //TODO rotate the player mesh down
  }
  faceRight = () => {
    //TODO rotate the player mesh right

  }
  faceUp = () => {
    //TODO rotate the player mesh up

  }
  faceLeft = () => {
    //TODO rotate the player mesh left

  }

  checkKeyStates = () => {
    if (this.keyState["ArrowLeft"]) {
      this.playerIsMoving = true;
      this.player.position.x -=
        this.moveSpeed * Math.sin(this.player.rotation.y);
      this.player.position.z -=
        this.moveSpeed * Math.cos(this.player.rotation.y);
    }

    if (this.keyState["ArrowRight"]) {
      this.playerIsMoving = true;

      this.player.position.x +=
        this.moveSpeed * Math.sin(this.player.rotation.y);
      this.player.position.z +=
        this.moveSpeed * Math.cos(this.player.rotation.y);
    }

    if (this.keyState["ArrowDown"]) {
      this.playerIsMoving = true;

      this.player.position.x -=
        this.moveSpeed * Math.cos(this.player.rotation.y);
      this.player.position.z +=
        this.moveSpeed * Math.sin(this.player.rotation.y);
    }

    if (this.keyState["ArrowUp"]) {
      this.playerIsMoving = true;

      this.player.position.x +=
        this.moveSpeed * Math.cos(this.player.rotation.y);
      this.player.position.z -=
        this.moveSpeed * Math.sin(this.player.rotation.y);
    }
    if (this.playerIsMoving) {
      if (_.get(this, "socket.emit")) {
        this.socket.emit("player moved", {
          username: this.player.username,
          orientation: {
            position: {
              x: this.player.position.x,
              y: this.player.position.y,
              z: this.player.position.z,
            },
            rotation: {
              x: this.player.rotation.x,
              y: this.player.rotation.y,
              z: this.player.rotation.z,
            },
          },
        });
      }
    }
  };

  onKeyChange = (event: any | undefined, keyState: any, value:boolean) => {
    event = event || window.event;
    keyState[event.key] = value;
  };

  prototype = () => {
    return Object.create(THREE.EventDispatcher.prototype);
  };
}
