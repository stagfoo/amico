import * as THREE from "three";
import * as _ from 'lodash';
import { CanvasTexture } from "three";

let camera: THREE.PerspectiveCamera,
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer;

let username: any;
let container:any;
let controls: { update: () => void; init: () => void };
let otherPlayers:any = {};
let player:any;
let socket: any;

let PlayerControls:any = function (
  this: any,
  camera: any,
  player: {
    position: {
      x: number | undefined;
      y: number | undefined;
      z: number | undefined;
    };
  },
  domElement: undefined
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
      angle = getAutoRotationAngle();
    }

    thetaDelta -= angle;
  };

  this.rotateRight = function (angle: number | undefined) {
    if (angle === undefined) {
      angle = getAutoRotationAngle();
    }

    thetaDelta += angle;
  };

  this.rotateUp = function (angle: number | undefined) {
    if (angle === undefined) {
      angle = getAutoRotationAngle();
    }

    phiDelta -= angle;
  };

  this.rotateDown = function (angle: number | undefined) {
    if (angle === undefined) {
      angle = getAutoRotationAngle();
    }

    phiDelta += angle;
  };

  this.zoomIn = function (zoomScale: number | undefined) {
    if (zoomScale === undefined) {
      zoomScale = getZoomScale();
    }

    scale /= zoomScale;
  };

  this.zoomOut = function (zoomScale: number | undefined) {
    if (zoomScale === undefined) {
      zoomScale = getZoomScale();
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
        username: username,
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

  function getAutoRotationAngle() {
    return ((2 * Math.PI) / 60 / 60) * scope.autoRotateSpeed;
  }

  function getZoomScale() {
    return Math.pow(0.95, scope.userZoomSpeed);
  }

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

  function onKeyDown(event: any | undefined) {
    event = event || window.event;
    keyState[event.keyCode || event.which] = true;
  }

  function onKeyUp(event: any | undefined) {
    event = event || window.event;
    keyState[event.keyCode || event.which] = false;
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
  this.domElement.addEventListener("keydown", onKeyDown, false);
  this.domElement.addEventListener("keyup", onKeyUp, false);
};

PlayerControls.prototype = Object.create(THREE.EventDispatcher.prototype);

init();
animate();

function init() {
  // Setup
  container = document.getElementById("container");

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
  let videoSprite = new THREE.Sprite(createVideoTexture("youtube-video"));
  videoSprite.position.y = 1;
  videoSprite.position.z = 1;
  videoSprite.position.x = 1;
  videoSprite.scale.set(1, 1, 1);
  scene.add(videoSprite);
  console.log("added");
  // renderer = new CSS3DRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  // Events
  window.addEventListener("resize", onWindowResize, false);

  container.appendChild(renderer.domElement);
  document.body.prepend(container);
}

function animate() {
  requestAnimationFrame(animate);

  if (controls) {
    controls.update();
  }

  render();
}

function render() {
  //   renderer.clear();
  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function createVideoTexture(id: string) {
  let video = (document.getElementById(id) as HTMLVideoElement);
  if(!_.isNil(video)){
    let texture = new THREE.VideoTexture(video);
    return new THREE.SpriteMaterial({
      map: texture,
      transparent: false,
    });
  }
  console.log('createVideoTexture '+id)
  return;
}

function makeLabelCanvas(baseWidth: number, size: number, name: string) {
  const domElm = document.createElement("canvas");
  const ctx = domElm.getContext("2d");
  const font = `${size}px bold sans-serif`;
  if(ctx){
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
  console.log('makeLabelCanvas')
  return;
}

//---------------Canvas Texture-------------------

// --------------Mesh Loader-----------------------
let loader = new THREE.BufferGeometryLoader();
// --------------Material-----------------------
const peep_tex = new THREE.TextureLoader().load("peeps/texture.png");
//TODO typing Texture
// const typingTexture = new THREE.TextureLoader().load("peeps/texture.png");
// const chatTexture = new THREE.TextureLoader().load("peeps/texture.png");
const peep_material = new THREE.MeshToonMaterial();
peep_material.emissiveMap = peep_tex;
peep_material.emissive = new THREE.Color(1, 1, 1);
// --------------Chat Bubbles-----------------------
function typingBubble(
  playerMesh: { add: (arg0: THREE.Sprite) => void },
  texture: THREE.CanvasTexture
) {
  const chatSprite = new THREE.SpriteMaterial({
    map: texture,
    transparent: false,
  });
  const chatBubble = new THREE.Sprite(chatSprite);
  chatBubble.position.y = 4.5;
  chatBubble.position.z = 0;
  chatBubble.position.x = 0;
  const scale = 1;
  chatBubble.scale.set(scale * 1.5, scale, scale);
  playerMesh.add(chatBubble);
}

// function messageBubble(playerMesh: { add: (arg0: THREE.Sprite) => void }) {
//   const chatSprite = new THREE.SpriteMaterial({
//     map: chatTexture,
//     transparent: true,
//   });
//   const chatBubble = new THREE.Sprite(chatSprite);
//   chatBubble.position.y = 5;
//   chatBubble.position.z = 0;
//   chatBubble.position.x = 0;
//   playerMesh.add(chatBubble);
// }

let Player:any = function (this: {
  playerID: any,
  isMainPlayer: boolean,
  mesh?: any,
  init?: any
  setOrientation?: any
}, playerID: string) {
  this.playerID = playerID;
  this.isMainPlayer = false;
  this.mesh;

  let scope = this;
  this.init = function () {
    loader.load("/peeps/mesh_1.json", function (geometry: any) {
      const usernameTexture = (makeLabelCanvas(
        playerID.length * 20,
        24,
        playerID
      ) as CanvasTexture);
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
    console.log('Loading Peep Mesh...')
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

// ----------------CHAT APP

  // Initialize variables
  let $usernameInput:any = $(".usernameInput"); // Input for username
  let $messages = $(".messages"); // Messages area
  let $inputMessage = $(".inputMessage"); // Input message input box

  let $loginPage = $(".login.page"); // The login page
  let $chatPage = $(".chat.page"); // The chatroom page

  // Prompt for setting a username
  let connected = false;
  let typing = false;
  let lastTypingTime: number;

  socket = io();

  function addParticipantsMessage(data: { numUsers?: number }) {
    let message = "";
    if (data.numUsers === 1) {
      message += "there's 1 participant";
    } else {
      message += "there are " + data.numUsers + " participants";
    }
    log(message, {
      prepend: false
    });
  }

  // Sets the client's username
  function setUsername() {
    username = cleanInput($usernameInput.val().trim());

    // If the username is valid
    if (username) {
      $loginPage.fadeOut();
      $chatPage.show();
      // Tell the server your username
      socket.emit("add user", {
        username: username,
        orientation: {},
      });
      //setup new player
      player = new Player(username);
      player.isMainPlayer = true;
      player.init();
    }
  }

  // Sends a chat message
  function sendMessage() {
    let message = $inputMessage.val();
    // Prevent markup from being injected into the message
    message = cleanInput(message);
    // if there is a non-empty message and a socket connection
    if (message && connected) {
      $inputMessage.val("");
      addChatMessage({
        username: username,
        message: message,
      }, {
        fade: false,
      });
      // tell server to execute 'new message' and send along one parameter
      socket.emit("new message", message);
    }
  }

  // Log a message
  function log(message: string, options: { prepend?: boolean, fade?:boolean }) {
    let $el = $("<li>").addClass("log").text(message);
    addMessageElement($el, options);
  }

  // Adds the visual chat message to the message list
  function addChatMessage(
    data: { username: any; message: any; typing?: any },
    options: { fade?: any } | undefined
  ) {
    // Don't fade the message in if there is an 'X was typing'
    let $typingMessages = getTypingMessages(data);
    options = options || {};
    if ($typingMessages.length !== 0) {
      options.fade = false;
      $typingMessages.remove();
    }

    let $usernameDiv = $('<span class="username"/>')
      .text(data.username)
      .css("color", getUsernameColor(data.username));
    let $messageBodyDiv = $('<span class="messageBody">').text(data.message);

    let typingClass = data.typing ? "typing" : "";
    let $messageDiv = $('<li class="message"/>')
      .data("username", data.username)
      .addClass(typingClass)
      .append($usernameDiv, $messageBodyDiv);

    addMessageElement($messageDiv, options);
  }

  // Adds the visual chat typing message
  function addChatTyping(data: { typing: boolean; message: string, username: string }) {
    data.typing = true;
    data.message = "is typing";
    if (data.typing) {
    }
    addChatMessage(data, { fade: false });
  }

  // Removes the visual chat typing message
  function removeChatTyping(data: any) {
    getTypingMessages(data).fadeOut(function () {
      $(this).remove();
    });
  }

  function addMessageElement(el: any, options: { fade?: any; prepend?: any }) {
    let $el = $(el);
    // Setup default options
    if (!options) {
      options = {};
    }
    if (typeof options.fade === "undefined") {
      options.fade = true;
    }
    if (typeof options.prepend === "undefined") {
      options.prepend = false;
    }

    if (options.prepend) {
      $messages.prepend($el);
    } else {
      $messages.append($el);
    }
    $messages[0].scrollTop = $messages[0].scrollHeight;
  }

  // Prevents input from having injected markup
  function cleanInput(input: any) {
    return $("<div/>").text(input).text();
  }

  // Updates the typing event
  function updateTyping() {
    if (connected) {
      if (!typing) {
        typing = true;
        socket.emit("typing");
      }
      lastTypingTime = new Date().getTime();

      setTimeout(function () {
        let typingTimer = new Date().getTime();
        let timeDiff = typingTimer - lastTypingTime;
        if (timeDiff >= 500 && typing) {
          socket.emit("stop typing");
          typing = false;
        }
      }, 500);
    }
  }

  // Gets the 'X is typing' messages of a user
  function getTypingMessages(data: { username: any }) {
    return $(".typing.message").filter(function () {
      return $(this).data("username") === data.username;
    });
  }

  // Gets the color of a username through our hash function
  function getUsernameColor(username: string) {
    // Compute hash code
    let hash = 7;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + (hash << 5) - hash;
    }
    // Calculate color
    return '#000000';
  }

  // Keyboard events

  $(window).keydown(function (event: {
    ctrlKey: any;
    metaKey: any;
    altKey: any;
    which: number;
  }) {
    // Auto-focus the current input when a key is typed
    if (!(event.ctrlKey || event.metaKey || event.altKey)) {
      // $currentInput.focus();
    }
    // When the client hits ENTER on their keyboard
    if (event.which === 13) {
      if (username) {
        sendMessage();
        socket.emit("stop typing");
        typing = false;
      } else {
        setUsername();
      }
    }
  });

  $inputMessage.on("input", function () {
    updateTyping();
  });

  // Socket events

  // Whenever the server emits 'login', log the login message
  socket.on("login", function (data: { currentUsers: {}, numUsers?: number }) {
    connected = true;
    // Display the welcome message
    let message = "Welcome to Socket.IO Chat – ";
    log(message, {
      prepend: true,
    });
    addParticipantsMessage(data);

    //didnt work??
    Object.keys(otherPlayers).map((k) => {
      console.log("login", data);
      if (!Object.keys(data.currentUsers).includes(k)) {
        otherPlayers[k] = new Player(k);
        otherPlayers[k].init();
      }
    });
  });

  // Whenever the server emits 'new message', update the chat body
  socket.on("new message", function (data: { username: string, message: string, numUsers?: number }) {
    addChatMessage(data, {
      fade: false
    });
  });

  socket.on(
    "player moved",
    function (data: { username: string; orientation: any }) {
      console.log("player moved", data);
      if (!Object.keys(otherPlayers).includes(data.username)) {
        otherPlayers[data.username] = new Player(data.username);
        otherPlayers[data.username].init();
      }
      console.log(otherPlayers);
      if (data.orientation && data.username) {
        otherPlayers[data.username].setOrientation(data.orientation);
      }
    }
  );

  // Whenever the server emits 'user joined', log it in the chat body
  socket.on("user joined", function (data: { username: string, numUsers: number }) {
    log(data.username + " joined", { prepend: false });
    addParticipantsMessage(data);
    if (username != data.username && !otherPlayers[data.username]) {
      otherPlayers[data.username] = new Player(data.username);
      otherPlayers[data.username].init();
    }
  });

  // Whenever the server emits 'user left', log it in the chat body
  socket.on("user left", function (data: { username: string, numUsers: number }) {
    log(data.username + " left", { prepend: false });
    addParticipantsMessage(data);
    removeChatTyping(data);
  });

  // Whenever the server emits 'typing', show the typing message
  socket.on("typing", function (data: any) {
    addChatTyping(data);
  });

  // Whenever the server emits 'stop typing', kill the typing message
  socket.on("stop typing", function (data: any) {
    removeChatTyping(data);
  });

