// Récupère le nom depuis l'URL
const urlParams = new URLSearchParams(window.location.search);
const playerName = urlParams.get("name") || "Empire Anon";
let myColor = "#ffffff"; // par défaut blanc


const socket = io();

// Envoie l'événement de join au serveur
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

function create() {
  this.graphics = this.add.graphics(); // Unique et important !

  // Centre la caméra sur la carte 300x300
  this.cameras.main.setZoom(0.5);
  this.cameras.main.centerOn(150, 150);

  // Contrôles caméra
  this.cursors = this.input.keyboard.addKeys({
    up: Phaser.Input.Keyboard.KeyCodes.W,
    down: Phaser.Input.Keyboard.KeyCodes.S,
    left: Phaser.Input.Keyboard.KeyCodes.A,
    right: Phaser.Input.Keyboard.KeyCodes.D
  });

  // Gestion du zoom à la molette
  this.input.on("wheel", (pointer, gameObjects, deltaX, deltaY) => {
    const cam = this.cameras.main;
    let newZoom = cam.zoom - deltaY * 0.001;
    newZoom = Phaser.Math.Clamp(newZoom, 0.1, 2);
    const worldPoint = cam.getWorldPoint(pointer.x, pointer.y);
    cam.setZoom(newZoom);
    const newWorldPoint = cam.getWorldPoint(pointer.x, pointer.y);
    cam.scrollX += worldPoint.x - newWorldPoint.x;
    cam.scrollY += worldPoint.y - newWorldPoint.y;
  });

  // Clic pour envoyer la target
  this.input.on("pointerdown", (pointer) => {
    const world = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
    socket.emit("updateTarget", { x: world.x, y: world.y });
  });

  // Bouton Exit
  const exitBtn = document.createElement("button");
  exitBtn.textContent = "Exit";
  exitBtn.style.position = "absolute";
  exitBtn.style.top = "20px";
  exitBtn.style.right = "20px";
  exitBtn.style.zIndex = 10;
  exitBtn.onclick = () => window.location.href = "/";
  document.body.appendChild(exitBtn);

  // Players list
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

// Phrase de statut de connexion
socket.on("connect", () => {
  const h2 = document.querySelector("h2");
  h2.textContent = `Connecté en tant que ${playerName}`;
  h2.style.color = myColor; // applique la couleur
});

// Mise à jour de la liste des joueurs et dessin des sphères
socket.on("playersList", (players) => {
  console.log("Reçu playersList:", players);

  // Trouve la couleur de mon joueur (via playerName)
  const me = players.find(p => p.name === playerName);
  if (me) {
    myColor = me.color; // sauvegarde la couleur de mon joueur
    document.querySelector("h2").style.color = myColor;
  }

  // Met à jour la liste texte
  const div = document.getElementById("playersList");
  let html = "<strong>Rank | Name | Boids</strong><br/>";
  players.forEach((p, i) => {
    html += `${i + 1}. ${p.name} (${p.boidsCount})<br/>`;
  });
  div.innerHTML = html;

  // Dessine les sphères
  const scene = game.scene.scenes[0];
  scene.graphics.clear();

  players.forEach(player => {
    const color = Phaser.Display.Color.HexStringToColor(player.color).color;
    scene.graphics.fillStyle(color, 1);
    scene.graphics.fillCircle(player.position.x, player.position.y, 20);
  });
});