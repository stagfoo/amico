import * as THREE from "three";
import * as _ from "lodash";

export class PlayerControls {
  player: any;
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

  constructor(
    camera: any,
    player: any,
    domElement: undefined,
    socket: undefined
  ) {
    this.camera = camera;
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
    this.STATE = { NONE: -1, ROTATE: 0, ZOOM: 1, PAN: 2 };
    this.state = this.STATE.NONE;
    this.domElement.addEventListener(
      "contextmenu",
      function (event: { preventDefault: () => void }) {
        event.preventDefault();
      },
      false
    );
    this.domElement.addEventListener("mousedown", this.onMouseDown, false);
    this.domElement.addEventListener("mousewheel", this.onMouseWheel, false);
    this.domElement.addEventListener(
      "DOMMouseScroll",
      this.onMouseWheel,
      false
    ); // firefox
    this.domElement.addEventListener(
      "keydown",
      (ev: any) => this.onKeyDown(ev, this.keyState),
      false
    );
    this.domElement.addEventListener(
      "keyup",
      (ev: any) => this.onKeyUp(ev, this.keyState),
      false
    );
  }

  // events
  rotateLeft = (angle: number | undefined) => {
    if (angle === undefined) {
      angle = this.getAutoRotationAngle();
    }

    this.thetaDelta -= angle;
  };

  rotateRight = (angle: number | undefined) => {
    if (angle === undefined) {
      angle = this.getAutoRotationAngle();
    }

    this.thetaDelta += angle;
  };

  rotateUp = (angle: number | undefined) => {
    if (angle === undefined) {
      angle = this.getAutoRotationAngle();
    }

    this.phiDelta -= angle;
  };

  rotateDown = (angle: number | undefined) => {
    if (angle === undefined) {
      angle = this.getAutoRotationAngle();
    }

    this.phiDelta += angle;
  };

  zoomIn = (zoomScale?: number | undefined) => {
    if (zoomScale === undefined) {
      zoomScale = this.getZoomScale();
    }

    this.scale /= zoomScale;
  };

  zoomOut = (zoomScale?: number | undefined) => {
    if (zoomScale === undefined) {
      zoomScale = this.getZoomScale();
    }

    this.scale *= zoomScale;
  };

  init = () => {
    this.camera.position.x = this.player.position.x + 2;
    this.camera.position.y = this.player.position.y + 2;
    this.camera.position.z = this.player.position.x + 2;
    this.camera.lookAt(this.player.position);
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

    if (this.autoRotate) {
      this.camera.position.x +=
        this.autoRotateSpeed *
        (this.player.position.x +
          8 * Math.sin(this.player.rotation.y) -
          this.camera.position.x);
      this.camera.position.z +=
        this.autoRotateSpeed *
        (this.player.position.z +
          8 * Math.cos(this.player.rotation.y) -
          this.camera.position.z);
    } else {
      position.copy(this.center).add(offset);
    }

    this.camera.lookAt(this.center);

    this.thetaDelta = 0;
    this.phiDelta = 0;
    this.scale = 1;

    if (this.state === this.STATE.NONE && this.playerIsMoving) {
      this.autoRotate = true;
    } else {
      this.autoRotate = false;
    }

    if (this.lastPosition.distanceTo(this.player.position) > 0) {
      this.lastPosition.copy(this.player.position);
    } else if (this.lastPosition.distanceTo(this.player.position) == 0) {
      this.playerIsMoving = false;
    }
  };

  checkKeyStates = () => {
    if (this.keyState[38] || this.keyState[87]) {
      // up arrow or 'w' - move forward
      this.playerIsMoving = true;

      this.player.position.x -=
        this.moveSpeed * Math.sin(this.player.rotation.y);
      this.player.position.z -=
        this.moveSpeed * Math.cos(this.player.rotation.y);
    }

    if (this.keyState[40] || this.keyState[83]) {
      // down arrow or 's' - move backward
      this.playerIsMoving = true;

      this.player.position.x +=
        this.moveSpeed * Math.sin(this.player.rotation.y);
      this.player.position.z +=
        this.moveSpeed * Math.cos(this.player.rotation.y);
    }

    if (this.keyState[81] || this.keyState[37] || this.keyState[65]) {
      // 'q' - strafe left
      this.playerIsMoving = true;

      this.player.position.x -=
        this.moveSpeed * Math.cos(this.player.rotation.y);
      this.player.position.z +=
        this.moveSpeed * Math.sin(this.player.rotation.y);
    }

    if (this.keyState[39] || this.keyState[68] || this.keyState[69]) {
      // 'e' - strage right
      this.playerIsMoving = true;

      this.player.position.x +=
        this.moveSpeed * Math.cos(this.player.rotation.y);
      this.player.position.z -=
        this.moveSpeed * Math.sin(this.player.rotation.y);
    }
    if (this.playerIsMoving) {
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
  };

  getAutoRotationAngle = () => {
    return ((2 * Math.PI) / 60 / 60) * this.autoRotateSpeed;
  };

  getZoomScale = () => {
    return Math.pow(0.95, this.userZoomSpeed);
  };

  onMouseDown = (event: {
    preventDefault: () => void;
    button: number;
    clientX: number;
    clientY: number;
  }) => {
    if (this.enabled === false) return;
    if (this.userRotate === false) return;

    event.preventDefault();

    if (event.button === 0) {
      this.state = this.STATE.ROTATE;

      this.rotateStart.set(event.clientX, event.clientY);
    } else if (event.button === 1) {
      this.state = this.STATE.ZOOM;
      this.zoomStart.set(event.clientX, event.clientY);
    }

    document.addEventListener("mousemove", this.onMouseMove, false);
    document.addEventListener("mouseup", this.onMouseUp, false);
  };

  onMouseMove = (event: {
    preventDefault: () => void;
    clientX: number;
    clientY: number;
  }) => {
    if (this.enabled === false) return;
    event.preventDefault();
    if (this.state === this.STATE.ROTATE) {
      this.rotateEnd.set(event.clientX, event.clientY);
      this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart);
      this.rotateLeft(
        ((2 * Math.PI * this.rotateDelta.x) / this.PIXELS_PER_ROUND) *
          this.userRotateSpeed
      );
      this.rotateUp(
        ((2 * Math.PI * this.rotateDelta.y) / this.PIXELS_PER_ROUND) *
          this.userRotateSpeed
      );
      this.rotateStart.copy(this.rotateEnd);
    } else if (this.state === this.STATE.ZOOM) {
      this.zoomEnd.set(event.clientX, event.clientY);
      this.zoomDelta.subVectors(this.zoomEnd, this.zoomStart);

      if (this.zoomDelta.y > 0) {
        this.zoomIn();
      } else {
        this.zoomOut();
      }

      this.zoomStart.copy(this.zoomEnd);
    }
  };

  onMouseUp = () => {
    if (this.enabled === false) return;
    if (this.userRotate === false) return;

    document.removeEventListener("mousemove", this.onMouseMove, false);
    document.removeEventListener("mouseup", this.onMouseUp, false);

    this.state = this.STATE.NONE;
  };

  onMouseWheel = (event: { wheelDelta: number; detail: number }) => {
    if (this.enabled === false) return;
    if (this.userRotate === false) return;

    let delta = 0;

    if (event.wheelDelta) {
      //WebKit / Opera / Explorer 9
      delta = event.wheelDelta;
    } else if (event.detail) {
      // Firefox
      delta = -event.detail;
    }

    if (delta > 0) {
      this.zoomOut();
    } else {
      this.zoomIn();
    }
  };
  onKeyDown = (event: any | undefined, keyState: any) => {
    //TODO wtf is this function
    event = event || window.event;
    console.log(event.key);
    keyState[event.keyCode || event.which] = true;
  };

  onKeyUp = (event: any | undefined, keyState: any) => {
    //TODO remove this function
    event = event || window.event;
    keyState[event.keyCode || event.which] = false;
  };
}

PlayerControls.prototype = Object.create(THREE.EventDispatcher.prototype);
