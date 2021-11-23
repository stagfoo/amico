import * as THREE from "three";
import * as _ from 'lodash';

export const PlayerControls:any = function (
    this: any,
    camera: any,
    player: {
      username: string,
      position: {
        x: number | undefined;
        y: number | undefined;
        z: number | undefined;
      };
    },
    domElement: undefined,
    socket: any
  ) {
    this.camera = camera;
    this.player = player;
    this.domElement = domElement !== undefined ? domElement : document;
    // API
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
  
    // internals
  
    let scope = this;
  
    let EPS = 0.000001;
    let PIXELS_PER_ROUND = 1800;
  
    let rotateStart = new THREE.Vector2();
    let rotateEnd = new THREE.Vector2();
    let rotateDelta = new THREE.Vector2();
  
    let zoomStart = new THREE.Vector2();
    let zoomEnd = new THREE.Vector2();
    let zoomDelta = new THREE.Vector2();
  
    let phiDelta = 0;
    let thetaDelta = 0;
    let scale = 1;
  
    let lastPosition = new THREE.Vector3(
      player.position.x,
      player.position.y,
      player.position.z
    );
    let playerIsMoving = false;
  
    let keyState:any = {};
    let STATE = { NONE: -1, ROTATE: 0, ZOOM: 1, PAN: 2 };
    let state = STATE.NONE;
  
    // events
  
    this.rotateLeft = function (angle: number | undefined) {
      if (angle === undefined) {
        angle = getAutoRotationAngle(scope);
      }
  
      thetaDelta -= angle;
    };
  
    this.rotateRight = function (angle: number | undefined) {
      if (angle === undefined) {
        angle = getAutoRotationAngle(scope);
      }
  
      thetaDelta += angle;
    };
  
    this.rotateUp = function (angle: number | undefined) {
      if (angle === undefined) {
        angle = getAutoRotationAngle(scope);
      }
  
      phiDelta -= angle;
    };
  
    this.rotateDown = function (angle: number | undefined) {
      if (angle === undefined) {
        angle = getAutoRotationAngle(scope);
      }
  
      phiDelta += angle;
    };
  
    this.zoomIn = function (zoomScale: number | undefined) {
      if (zoomScale === undefined) {
        zoomScale = getZoomScale(scope);
      }
  
      scale /= zoomScale;
    };
  
    this.zoomOut = function (zoomScale: number | undefined) {
      if (zoomScale === undefined) {
        zoomScale = getZoomScale(scope);
      }
  
      scale *= zoomScale;
    };
  
    this.init = function () {
      this.camera.position.x = this.player.position.x + 2;
      this.camera.position.y = this.player.position.y + 2;
      this.camera.position.z = this.player.position.x + 2;
  
      this.camera.lookAt(this.player.position);
    };
  
    this.update = function () {
      this.checkKeyStates();
  
      this.center = this.player.position;
  
      let position = this.camera.position;
      let offset = position.clone().sub(this.center);
  
      // angle from z-axis around y-axis
  
      let theta = Math.atan2(offset.x, offset.z);
  
      // angle from y-axis
  
      let phi = Math.atan2(
        Math.sqrt(offset.x * offset.x + offset.z * offset.z),
        offset.y
      );
  
      theta += thetaDelta;
      phi += phiDelta;
  
      // restrict phi to be between desired limits
      phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, phi));
  
      // restrict phi to be between EPS and PI-EPS
      phi = Math.max(EPS, Math.min(Math.PI - EPS, phi));
  
      let radius = offset.length() * scale;
  
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
  
      thetaDelta = 0;
      phiDelta = 0;
      scale = 1;
  
      if (state === STATE.NONE && playerIsMoving) {
        this.autoRotate = true;
      } else {
        this.autoRotate = false;
      }
  
      if (lastPosition.distanceTo(this.player.position) > 0) {
        lastPosition.copy(this.player.position);
      } else if (lastPosition.distanceTo(this.player.position) == 0) {
        playerIsMoving = false;
      }
    };
  
    this.checkKeyStates = function () {
      if (keyState[38] || keyState[87]) {
        // up arrow or 'w' - move forward
        playerIsMoving = true;
  
        this.player.position.x -=
          this.moveSpeed * Math.sin(this.player.rotation.y);
        this.player.position.z -=
          this.moveSpeed * Math.cos(this.player.rotation.y);
      }
  
      if (keyState[40] || keyState[83]) {
        // down arrow or 's' - move backward
        playerIsMoving = true;
  
        this.player.position.x +=
          this.moveSpeed * Math.sin(this.player.rotation.y);
        this.player.position.z +=
          this.moveSpeed * Math.cos(this.player.rotation.y);
      }
  
      if (keyState[81] || keyState[37] || keyState[65]) {
        // 'q' - strafe left
        playerIsMoving = true;
  
        this.player.position.x -=
          this.moveSpeed * Math.cos(this.player.rotation.y);
        this.player.position.z +=
          this.moveSpeed * Math.sin(this.player.rotation.y);
      }
  
      if (keyState[39] || keyState[68] || keyState[69]) {
        // 'e' - strage right
        playerIsMoving = true;
  
        this.player.position.x +=
          this.moveSpeed * Math.cos(this.player.rotation.y);
        this.player.position.z -=
          this.moveSpeed * Math.sin(this.player.rotation.y);
      }
      if (playerIsMoving) {
        socket.emit("player moved", {
          username: player.username,
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

function getAutoRotationAngle(scope: any) {
    return ((2 * Math.PI) / 60 / 60) * scope.autoRotateSpeed;
    }

function getZoomScale(scope: any) {
    return Math.pow(0.95, scope.userZoomSpeed);
};

function onMouseDown(event: {
    preventDefault: () => void;
    button: number;
    clientX: number;
    clientY: number;
  }) {
    if (scope.enabled === false) return;
    if (scope.userRotate === false) return;

    event.preventDefault();

    if (event.button === 0) {
      state = STATE.ROTATE;

      rotateStart.set(event.clientX, event.clientY);
    } else if (event.button === 1) {
      state = STATE.ZOOM;

      zoomStart.set(event.clientX, event.clientY);
    }

    document.addEventListener("mousemove", onMouseMove, false);
    document.addEventListener("mouseup", onMouseUp, false);
  }

  function onMouseMove(event: {
    preventDefault: () => void;
    clientX: number;
    clientY: number;
  }) {
    if (scope.enabled === false) return;

    event.preventDefault();

    if (state === STATE.ROTATE) {
      rotateEnd.set(event.clientX, event.clientY);
      rotateDelta.subVectors(rotateEnd, rotateStart);

      scope.rotateLeft(
        ((2 * Math.PI * rotateDelta.x) / PIXELS_PER_ROUND) *
          scope.userRotateSpeed
      );
      scope.rotateUp(
        ((2 * Math.PI * rotateDelta.y) / PIXELS_PER_ROUND) *
          scope.userRotateSpeed
      );

      rotateStart.copy(rotateEnd);
    } else if (state === STATE.ZOOM) {
      zoomEnd.set(event.clientX, event.clientY);
      zoomDelta.subVectors(zoomEnd, zoomStart);

      if (zoomDelta.y > 0) {
        scope.zoomIn();
      } else {
        scope.zoomOut();
      }

      zoomStart.copy(zoomEnd);
    }
  }

  function onMouseUp() {
    if (scope.enabled === false) return;
    if (scope.userRotate === false) return;

    document.removeEventListener("mousemove", onMouseMove, false);
    document.removeEventListener("mouseup", onMouseUp, false);

    state = STATE.NONE;
  }

  function onMouseWheel(event: { wheelDelta: number; detail: number }) {
    if (scope.enabled === false) return;
    if (scope.userRotate === false) return;

    let delta = 0;

    if (event.wheelDelta) {
      //WebKit / Opera / Explorer 9

      delta = event.wheelDelta;
    } else if (event.detail) {
      // Firefox

      delta = -event.detail;
    }

    if (delta > 0) {
      scope.zoomOut();
    } else {
      scope.zoomIn();
    }
  }

 

  this.domElement.addEventListener(
    "contextmenu",
    function (event: { preventDefault: () => void }) {
      event.preventDefault();
    },
    false
  );
  this.domElement.addEventListener("mousedown", onMouseDown, false);
  this.domElement.addEventListener("mousewheel", onMouseWheel, false);
  this.domElement.addEventListener("DOMMouseScroll", onMouseWheel, false); // firefox
  this.domElement.addEventListener("keydown", (ev:any) => onKeyDown(ev, keyState), false);
  this.domElement.addEventListener("keyup", (ev:any) => onKeyUp(ev, keyState), false);
};

PlayerControls.prototype = Object.create(THREE.EventDispatcher.prototype);

function onKeyDown(event: any | undefined, keyState: any) {
    //TODO wtf is this function
    event = event || window.event;
    keyState[event.keyCode || event.which] = true;
  }

  function onKeyUp(event: any | undefined, keyState: any,) {
    //TODO remove this function
    event = event || window.event;
    keyState[event.keyCode || event.which] = false;
  }