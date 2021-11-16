import * as THREE from "https://cdn.skypack.dev/three";

let camera, scene, renderer;
let geometry, material, mesh;

var username;
var container;
var controls;
var otherPlayers = {};
var playerID;
var player;

var PlayerControls = function (camera, player, domElement) {
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

  var scope = this;

  var EPS = 0.000001;
  var PIXELS_PER_ROUND = 1800;

  var rotateStart = new THREE.Vector2();
  var rotateEnd = new THREE.Vector2();
  var rotateDelta = new THREE.Vector2();

  var zoomStart = new THREE.Vector2();
  var zoomEnd = new THREE.Vector2();
  var zoomDelta = new THREE.Vector2();

  var phiDelta = 0;
  var thetaDelta = 0;
  var scale = 1;

  var lastPosition = new THREE.Vector3(
    player.position.x,
    player.position.y,
    player.position.z
  );
  var playerIsMoving = false;

  var keyState = {};
  var STATE = { NONE: -1, ROTATE: 0, ZOOM: 1, PAN: 2 };
  var state = STATE.NONE;

  // events

  var changeEvent = { type: "change" };

  this.rotateLeft = function (angle) {
    if (angle === undefined) {
      angle = getAutoRotationAngle();
    }

    thetaDelta -= angle;
  };

  this.rotateRight = function (angle) {
    if (angle === undefined) {
      angle = getAutoRotationAngle();
    }

    thetaDelta += angle;
  };

  this.rotateUp = function (angle) {
    if (angle === undefined) {
      angle = getAutoRotationAngle();
    }

    phiDelta -= angle;
  };

  this.rotateDown = function (angle) {
    if (angle === undefined) {
      angle = getAutoRotationAngle();
    }

    phiDelta += angle;
  };

  this.zoomIn = function (zoomScale) {
    if (zoomScale === undefined) {
      zoomScale = getZoomScale();
    }

    scale /= zoomScale;
  };

  this.zoomOut = function (zoomScale) {
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

    var position = this.camera.position;
    var offset = position.clone().sub(this.center);

    // angle from z-axis around y-axis

    var theta = Math.atan2(offset.x, offset.z);

    // angle from y-axis

    var phi = Math.atan2(
      Math.sqrt(offset.x * offset.x + offset.z * offset.z),
      offset.y
    );

    theta += thetaDelta;
    phi += phiDelta;

    // restrict phi to be between desired limits
    phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, phi));

    // restrict phi to be between EPS and PI-EPS
    phi = Math.max(EPS, Math.min(Math.PI - EPS, phi));

    var radius = offset.length() * scale;

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
    if(playerIsMoving) {
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
            }
          });
    }

  };

  function getAutoRotationAngle() {
    return ((2 * Math.PI) / 60 / 60) * scope.autoRotateSpeed;
  }

  function getZoomScale() {
    return Math.pow(0.95, scope.userZoomSpeed);
  }

  function onMouseDown(event) {
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

  function onMouseMove(event) {
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

  function onMouseUp(event) {
    if (scope.enabled === false) return;
    if (scope.userRotate === false) return;

    document.removeEventListener("mousemove", onMouseMove, false);
    document.removeEventListener("mouseup", onMouseUp, false);

    state = STATE.NONE;
  }

  function onMouseWheel(event) {
    if (scope.enabled === false) return;
    if (scope.userRotate === false) return;

    var delta = 0;

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

  function onKeyDown(event) {
    event = event || window.event;

    keyState[event.keyCode || event.which] = true;
  }

  function onKeyUp(event) {
    event = event || window.event;

    keyState[event.keyCode || event.which] = false;
  }

  this.domElement.addEventListener(
    "contextmenu",
    function (event) {
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
  var axes = new THREE.AxesHelper(5);
  scene.add(axes);
  var gridXZ = new THREE.GridHelper(100, 10);
  gridXZ.position.set(0, 0);
  scene.add(gridXZ);

  camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  // Events
  window.addEventListener("resize", onWindowResize, false);

  container.appendChild(renderer.domElement);
  document.body.appendChild(container);
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




function makeLabelCanvas(baseWidth, size, name){
  const domElm = document.createElement('canvas');
  const ctx = domElm.getContext('2d');
  const font =  `${size}px bold sans-serif`;
  ctx.font = font;
  const width = baseWidth
  const height = 50
  // measure how long the name will be
  ctx.canvas.width = width;
  ctx.canvas.height = height;
  // need to set font again after resizing canvas
  ctx.font = font;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';

  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, width, height);

  // scale to fit but don't stretch
  ctx.translate(width / 2, height / 2);
  ctx.scale(1, 1);
  ctx.fillStyle = 'white';
  ctx.fillText(name, 0, 0);
  document.body.appendChild(domElm)
  return new THREE.CanvasTexture(ctx.canvas);
}

//---------------Canvas Texture-------------------


// --------------Mesh Loader-----------------------
var loader = new THREE.BufferGeometryLoader();
// --------------Material-----------------------
const peep_tex = new THREE.TextureLoader().load("peeps/texture.png");
const typingTexture = new THREE.TextureLoader().load("peeps/texture.png");
const chatTexture = new THREE.TextureLoader().load("peeps/texture.png");
const peep_material = new THREE.MeshToonMaterial();
peep_material.emissiveMap = peep_tex;
peep_material.emissive = new THREE.Color(1, 1, 1);
// --------------Chat Bubbles-----------------------
function typingBubble(playerMesh, texture){
  const chatSprite = new THREE.SpriteMaterial({
    map: texture,
    transparent: false,
  });
  const chatBubble = new THREE.Sprite(chatSprite);
  chatBubble.position.y = 4.5;
  chatBubble.position.z = 0;
  chatBubble.position.x = 0;
  const scale = 1;
  chatBubble.scale.set(scale*1.5, scale, scale);
  playerMesh.add(chatBubble);
}

function messageBubble(playerMesh){
  const chatSprite = new THREE.SpriteMaterial({
    map: chatTexture,
    transparent: true,
  });
  const chatBubble = new THREE.Sprite(chatSprite);
  chatBubble.position.y = 5;
  chatBubble.position.z = 0;
  chatBubble.position.x = 0;
  playerMesh.add(chatBubble);
}


var Player = function (playerID) {
  this.playerID = playerID;
  this.isMainPlayer = false;
  this.mesh;

  var scope = this;
  this.init = function () {
    loader.load("/peeps/mesh_1.json", function (geometry, material) {
      const usernameTexture = makeLabelCanvas(playerID.length * 20, 24,  playerID);
      scope.mesh = new THREE.Mesh(geometry, peep_material);
      scope.mesh.scale.set(0.5, 0.5, 0.5);
      scope.mesh.rotateY(-180);
      typingBubble(scope.mesh, usernameTexture);
      scene.add(scope.mesh);

      if (scope.isMainPlayer) {
        // Give player control of this mesh
        controls = new PlayerControls(camera, scope.mesh);
        controls.init();
      }
    });
  };

  this.setOrientation = function (orientation) {
    if (scope.mesh) {
      scope.mesh.position.copy(orientation.position);
    //   scope.mesh.rotation.x = rotation.x;
    //   scope.mesh.rotation.y = rotation.y;
    //   scope.mesh.rotation.z = rotation.z;
    }
  };
};

// ----------------CHAT APP
$(function () {
  var FADE_TIME = 150; // ms
  var TYPING_TIMER_LENGTH = 400; // ms
  var COLORS = [
    "#e21400",
    "#91580f",
    "#f8a700",
    "#f78b00",
    "#58dc00",
    "#287b00",
    "#a8f07a",
    "#4ae8c4",
    "#3b88eb",
    "#3824aa",
    "#a700ff",
    "#d300e7",
  ];

  // Initialize variables
  var $window = $(window);
  var $usernameInput = $(".usernameInput"); // Input for username
  var $messages = $(".messages"); // Messages area
  var $inputMessage = $(".inputMessage"); // Input message input box

  var $loginPage = $(".login.page"); // The login page
  var $chatPage = $(".chat.page"); // The chatroom page

  // Prompt for setting a username
  var connected = false;
  var typing = false;
  var lastTypingTime;
  var $currentInput = $usernameInput.focus();

  var socket = io();
  window.socket = socket;

  function addParticipantsMessage(data) {
    var message = "";
    if (data.numUsers === 1) {
      message += "there's 1 participant";
    } else {
      message += "there are " + data.numUsers + " participants";
    }
    log(message);
  }

  // Sets the client's username
  function setUsername() {
    username = cleanInput($usernameInput.val().trim());

    // If the username is valid
    if (username) {
      $loginPage.fadeOut();
      $chatPage.show();
      $currentInput = $inputMessage.focus();
      loadGame();
      // Tell the server your username
      socket.emit("add user", {
        username: username,
       orientation: {}
      });
      //setup new player
      player = new Player(username);
      player.isMainPlayer = true;
      player.init();
    }
  }

  // Sends a chat message
  function sendMessage() {
    var message = $inputMessage.val();
    // Prevent markup from being injected into the message
    message = cleanInput(message);
    // if there is a non-empty message and a socket connection
    if (message && connected) {
      $inputMessage.val("");
      addChatMessage({
        username: username,
        message: message,
      });
      // tell server to execute 'new message' and send along one parameter
      socket.emit("new message", message);
    }
  }

  // Log a message
  function log(message, options) {
    var $el = $("<li>").addClass("log").text(message);
    addMessageElement($el, options);
  }

  // Adds the visual chat message to the message list
  function addChatMessage(data, options) {
    // Don't fade the message in if there is an 'X was typing'
    var $typingMessages = getTypingMessages(data);
    options = options || {};
    if ($typingMessages.length !== 0) {
      options.fade = false;
      $typingMessages.remove();
    }

    var $usernameDiv = $('<span class="username"/>')
      .text(data.username)
      .css("color", getUsernameColor(data.username));
    var $messageBodyDiv = $('<span class="messageBody">').text(data.message);

    var typingClass = data.typing ? "typing" : "";
    var $messageDiv = $('<li class="message"/>')
      .data("username", data.username)
      .addClass(typingClass)
      .append($usernameDiv, $messageBodyDiv);

    addMessageElement($messageDiv, options);
  }

  // Adds the visual chat typing message
  function addChatTyping(data) {
    data.typing = true;
    data.message = "is typing";
    if(data.typing){

    }
    addChatMessage(data);
  }

  // Removes the visual chat typing message
  function removeChatTyping(data) {
    getTypingMessages(data).fadeOut(function () {
      $(this).remove();
    });
  }

  // Adds a message element to the messages and scrolls to the bottom
  // el - The element to add as a message
  // options.fade - If the element should fade-in (default = true)
  // options.prepend - If the element should prepend
  //   all other messages (default = false)
  function addMessageElement(el, options) {
    var $el = $(el);

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

    // Apply options
    if (options.fade) {
      $el.hide().fadeIn(FADE_TIME);
    }
    if (options.prepend) {
      $messages.prepend($el);
    } else {
      $messages.append($el);
    }
    $messages[0].scrollTop = $messages[0].scrollHeight;
  }

  // Prevents input from having injected markup
  function cleanInput(input) {
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
        var typingTimer = new Date().getTime();
        var timeDiff = typingTimer - lastTypingTime;
        if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
          socket.emit("stop typing");
          typing = false;
        }
      }, TYPING_TIMER_LENGTH);
    }
  }

  // Gets the 'X is typing' messages of a user
  function getTypingMessages(data) {
    return $(".typing.message").filter(function (i) {
      return $(this).data("username") === data.username;
    });
  }

  // Gets the color of a username through our hash function
  function getUsernameColor(username) {
    // Compute hash code
    var hash = 7;
    for (var i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + (hash << 5) - hash;
    }
    // Calculate color
    var index = Math.abs(hash % COLORS.length);
    return COLORS[index];
  }

  // Keyboard events

  $window.keydown(function (event) {
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
  socket.on("login", function (data) {
    connected = true;
    // Display the welcome message
    var message = "Welcome to Socket.IO Chat – ";
    log(message, {
      prepend: true,
    });
    addParticipantsMessage(data);
    //didnt work??
    Object.keys(otherPlayers).map(k => {
        console.log('login', data)
        if(!Object.keys(data.currentUsers).includes(k)){
            otherPlayers[k] = new Player(k);
            otherPlayers[k].init();
        }
    })
  });

  // Whenever the server emits 'new message', update the chat body
  socket.on("new message", function (data) {
    addChatMessage(data);
  });

  socket.on("player moved", function (data) {
      console.log("player moved", data);
      if(!Object.keys(otherPlayers).includes(data.username)){
        otherPlayers[data.username] = new Player(data.username);
        otherPlayers[data.username].init();
    }
    console.log(otherPlayers)
      if(data.orientation && data.username){
        otherPlayers[data.username].setOrientation(data.orientation);
      }

  });

  // Whenever the server emits 'user joined', log it in the chat body
  socket.on("user joined", function (data) {
    log(data.username + " joined");
    addParticipantsMessage(data);
      if (username != data.username && !otherPlayers[data.username]) {
        otherPlayers[data.username] = new Player(data.username);
        otherPlayers[data.username].init();
      }
  });

  // Whenever the server emits 'user left', log it in the chat body
  socket.on("user left", function (data) {
    log(data.username + " left");
    addParticipantsMessage(data);
    removeChatTyping(data);
  });

  // Whenever the server emits 'typing', show the typing message
  socket.on("typing", function (data) {
    addChatTyping(data);
  });

  // Whenever the server emits 'stop typing', kill the typing message
  socket.on("stop typing", function (data) {
    removeChatTyping(data);
  });
});

function loadGame() {
  // load the environment
  // loadEnvironment();
  // load the player
  // initMainPlayer();

  // listenToOtherPlayers();

  window.onunload = function () {
    socket.emit("player left", playerID);
  };

  window.onbeforeunload = function () {
    socket.emit("player left", playerID);
  };
}

function loadEnvironment() {
  var sphere_geometry = new THREE.SphereGeometry(1);
  var sphere_material = new THREE.MeshNormalMaterial();
  var sphere = new THREE.Mesh(sphere_geometry, sphere_material);
  //center
  scene.add(sphere);
}
