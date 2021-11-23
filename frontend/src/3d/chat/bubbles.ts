const typingTexture = new THREE.TextureLoader().load("peeps/texture.png");
const chatTexture = new THREE.TextureLoader().load("peeps/texture.png");

function messageBubble(playerMesh: { add: (arg0: THREE.Sprite) => void }, texture: THREE.CanvasTexture) {
  const chatSprite = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
  });
  const chatBubble = new THREE.Sprite(chatSprite);
  chatBubble.position.y = 5;
  chatBubble.position.z = 0;
  chatBubble.position.x = 0;
  playerMesh.add(chatBubble);
}

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