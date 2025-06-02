// client.js
const urlParams = new URLSearchParams(window.location.search);
const playerName = urlParams.get("name") || "Empire Anon";
let myColor = "#ffffff";

const socket = io();
socket.emit("joinGame", { name: playerName });
console.log("Client.js chargé et prêt !");

// Phaser config
const config = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  backgroundColor: "#222",
  scene: { create, update }
};
const game = new Phaser.Game(config);

let heightMap = null;
let heightMapTexture = null;

function create() {
  const scene = this;
  scene.graphics = scene.add.graphics();
  scene.cameras.main.setZoom(0.5);
  scene.cameras.main.centerOn(150, 150);

  scene.cursors = scene.input.keyboard.addKeys({
    up: Phaser.Input.Keyboard.KeyCodes.W,
    down: Phaser.Input.Keyboard.KeyCodes.S,
    left: Phaser.Input.Keyboard.KeyCodes.A,
    right: Phaser.Input.Keyboard.KeyCodes.D
  });

  scene.input.on("wheel", (pointer, gameObjects, deltaX, deltaY) => {
    const cam = scene.cameras.main;
    let newZoom = cam.zoom - deltaY * 0.001;
    newZoom = Phaser.Math.Clamp(newZoom, 0.1, 2);
    const worldPoint = cam.getWorldPoint(pointer.x, pointer.y);
    cam.setZoom(newZoom);
    const newWorldPoint = cam.getWorldPoint(pointer.x, pointer.y);
    cam.scrollX += worldPoint.x - newWorldPoint.x;
    cam.scrollY += worldPoint.y - newWorldPoint.y;
  });

  scene.input.on("pointerdown", (pointer) => {
    const world = scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
    socket.emit("updateTarget", { x: world.x, y: world.y });
  });

  const exitBtn = document.createElement("button");
  exitBtn.textContent = "Exit";
  exitBtn.style.position = "absolute";
  exitBtn.style.top = "20px";
  exitBtn.style.right = "20px";
  exitBtn.style.zIndex = 10;
  exitBtn.onclick = () => window.location.href = "/";
  document.body.appendChild(exitBtn);

  const playersList = document.createElement("div");
  playersList.id = "playersList";
  playersList.style.position = "absolute";
  playersList.style.top = "20px";
  playersList.style.left = "20px";
  playersList.style.background = "rgba(0,0,0,0.5)";
  playersList.style.color = "#fff";
  playersList.style.padding = "10px";
  playersList.style.borderRadius = "5px";
  playersList.style.zIndex = 10;
  document.body.appendChild(playersList);
}

function update() {
  const cam = this.cameras.main;
  const speed = 5 / cam.zoom;
  if (this.cursors.up.isDown) cam.scrollY -= speed;
  if (this.cursors.down.isDown) cam.scrollY += speed;
  if (this.cursors.left.isDown) cam.scrollX -= speed;
  if (this.cursors.right.isDown) cam.scrollX += speed;
}

socket.on("connect", () => {
  const h2 = document.querySelector("h2");
  h2.textContent = `Connecté en tant que ${playerName}`;
  h2.style.color = myColor;
});

socket.on("initMap", (map) => {
  console.log("🌍 Height map reçue !");
  heightMap = map;
  createHeightMapTexture();
});

function createHeightMapTexture() {
  const scene = game.scene.scenes[0];
  const width = heightMap[0].length;
  const height = heightMap.length;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const h = heightMap[y][x];
      let color;
      if (h <= 0.1) color = "blue";
      else if (h < 0.2) color = "yellow";
      else if (h < 0.5) color = "green";
      else if (h < 0.8) color = "brown";
      else color = "white";
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    }
  }

  const texture = scene.textures.addCanvas("heightmap", canvas);
  heightMapTexture = scene.add.image(0, 0, "heightmap").setOrigin(0);
  heightMapTexture.setDepth(-1); // Derrière tout le reste
}

socket.on("gameState", (state) => {
  const scene = game.scene.scenes[0];
  scene.graphics.clear();

  state.scraps.forEach(scrap => {
    scene.graphics.fillStyle(0x0000ff, 1);
    scene.graphics.fillRect(scrap.x - 5, scrap.y - 5, 10, 10);
  });

  state.players.forEach(player => {
    const color = Phaser.Display.Color.HexStringToColor(player.color).color;
    player.boids.forEach(boid => {
      scene.graphics.lineStyle(2, 0xffffff, 1);
      scene.graphics.strokeCircle(boid.x, boid.y, 10);
      scene.graphics.fillStyle(color, 1);
      scene.graphics.fillCircle(boid.x, boid.y, 10);
    });
  });

  state.projectiles.forEach(proj => {
    const color = Phaser.Display.Color.HexStringToColor(proj.color).color;
    scene.graphics.fillStyle(color, 1);
    scene.graphics.fillCircle(proj.x, proj.y, 5);
  });

  // Zone d'hover (curseur)
  state.players.forEach(player => {
    if (player.id === socket.id) {
      scene.graphics.lineStyle(2, 0xffffff, 0.3);
      scene.graphics.strokeCircle(player.position.x, player.position.y, 50);
    }
  });

  state.dca.forEach(dca => {
    scene.graphics.fillStyle(0xff0000, 1);
    scene.graphics.fillRect(dca.x - 15, dca.y - 15, 30, 30);
  });

  const div = document.getElementById("playersList");
  let html = "<strong>Rank | Name | Boids | Scraps</strong><br/>";
  state.players.forEach((p, i) => {
    html += `${i + 1}. ${p.name} (${p.boidsCount} boids, ${p.scrapsCount || 0} scraps)<br/>`;
  });
  div.innerHTML = html;

  const me = state.players.find(p => p.name === playerName);
  if (me) {
    myColor = me.color;
    document.querySelector("h2").style.color = myColor;
  }
});
