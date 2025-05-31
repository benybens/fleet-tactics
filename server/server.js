const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const colorPalette = [
  "#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF",
  "#FF6EC7", "#00B8A9", "#FFC300", "#845EC2"
];

const scrapsManager = require("./scrapsManager");

setInterval(() => {
  scrapsManager.updateScraps();
}, 1000);


app.use(express.static("public"));

let players = [];

io.on("connection", (socket) => {
  console.log("Joueur connecté :", socket.id);

  socket.on("joinGame", (data) => {
    // Supprime un éventuel doublon
    players = players.filter(p => p.id !== socket.id);
  
    const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
    const spawnPosition = {
      x: Math.floor(Math.random() * 300),
      y: Math.floor(Math.random() * 300)
    };
  
    players.push({
      id: socket.id,
      name: data.name,
      boidsCount: 0,
      rank: players.length + 1,
      color: color,
      position: spawnPosition,
      target: spawnPosition,
      boids: [] // <= Liste des boids pour chaque joueur
    });
  
    sendPlayersList();
  });
  
  socket.on("updateTarget", (target) => {
    console.log(`> Nouvelle cible reçue pour ${socket.id} :`, target);
  
    const player = players.find(p => p.id === socket.id);
    if (player) {
      player.target = target;
  
      // Clear l'ancien interval s'il existe
      if (player.movementInterval) {
        clearInterval(player.movementInterval);
      }
  
      const start = { ...player.position };
      const end = target;
      const direction = {
        x: end.x - start.x,
        y: end.y - start.y
      };
      const distance = Math.sqrt(direction.x ** 2 + direction.y ** 2);
  
      direction.x /= distance;
      direction.y /= distance;
  
      const speed = player.speed || 300; // pixels / seconde
  
      player.movementInterval = setInterval(() => {
        const dt = 16 / 1000; // secondes (16 ms par tick)
        const moveDist = speed * dt;
  
        const toTargetX = end.x - player.position.x;
        const toTargetY = end.y - player.position.y;
        const distToTarget = Math.sqrt(toTargetX ** 2 + toTargetY ** 2);
  
        if (distToTarget <= moveDist) {
          player.position = { ...end };
          clearInterval(player.movementInterval);
          player.movementInterval = null;
        } else {
          player.position.x += direction.x * moveDist;
          player.position.y += direction.y * moveDist;
        }
      }, 16);
    }
  });

  socket.on("disconnect", () => {
    players = players.filter(p => p.id !== socket.id);
    sendPlayersList();
  });
});



function sendPlayersList() {
  io.emit("playersList", players);
}

// Ajout d’un boid pour un joueur
function addBoidToPlayer(player) {
  const angle = Math.random() * Math.PI * 2;
  const distance = 30 + Math.random() * 20;
  player.boids.push({ offsetAngle: angle, distance: distance });
}


setInterval(() => {
// Vérifie collisions pour chaque joueur

// Quand un scrap est collecté, ajoute un boid
players.forEach(player => {
  // Collision pour la sphère principale
  scrapsManager.getScraps().forEach(scrap => {
    const dx = player.position.x - scrap.x;
    const dy = player.position.y - scrap.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 20 + 5) { // rayon joueur + demi-largeur scrap
      scrapsManager.collectScrap(scrap.id);
      player.boidsCount++;
      addBoidToPlayer(player);
    }
  });

  // Collision pour les boids
  player.boids.forEach(boid => {
    const boidX = player.position.x + Math.cos(boid.offsetAngle) * boid.distance;
    const boidY = player.position.y + Math.sin(boid.offsetAngle) * boid.distance;

    scrapsManager.getScraps().forEach(scrap => {
      const dx = boidX - scrap.x;
      const dy = boidY - scrap.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 10 + 5) { // rayon boid (10) + demi-largeur scrap (5)
        scrapsManager.collectScrap(scrap.id);
        player.boidsCount++;
        addBoidToPlayer(player);
      }
    });
  });
}); 

// Animation des boids
players.forEach(player => {
  player.boids.forEach(boid => {
    // Petit random walk de l’angle
    boid.offsetAngle += (Math.random() - 0.5) * 0.05;
  });
});

// Mise à jour des positions des boids
const safePlayers = players.map(p => ({
  id: p.id,
  name: p.name,
  boidsCount: p.boidsCount,
  rank: p.rank,
  color: p.color,
  position: p.position,
  boids: p.boids.map(boid => ({
    x: p.position.x + Math.cos(boid.offsetAngle) * boid.distance,
    y: p.position.y + Math.sin(boid.offsetAngle) * boid.distance
  }))
}));

io.emit("gameState", {
  players: safePlayers,
  scraps: scrapsManager.getScraps()
});
}, 33);

server.listen(3000, "0.0.0.0", () => {
  console.log("Serveur lancé sur http://0.0.0.0:3000");
});

