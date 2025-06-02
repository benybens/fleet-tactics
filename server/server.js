const express = require("express");
const http = require("http");
const socketIo = require("socket.io");


const { initPlayerManager, handleJoin, handleUpdateTarget, handleDisconnect } = require("./playerManager");
const { updateGame } = require("./gameLoop");
const dcaManager = require("./dcaManager");
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static("public"));

// Initialiser le gestionnaire de joueurs et la loop
initPlayerManager(io);
const { generateHeightMap } = require("./mapManager");

// Génère la height map une fois au démarrage
const heightMap = generateHeightMap();
updateGame(io);

// Au démarrage
dcaManager.generateDCA(3); // densité à 20% par exemple

// Connexion socket.io
io.on("connection", (socket) => {
  console.log("Joueur connecté :", socket.id);
    // Envoie la height map dès la connexion
  socket.emit("initMap", heightMap);

  socket.on("joinGame", (data) => handleJoin(socket, data));
  socket.on("updateTarget", (target) => handleUpdateTarget(socket, target));
  socket.on("disconnect", () => handleDisconnect(socket));
});

server.listen(3000, "0.0.0.0", () => {
  console.log("Serveur lancé sur http://0.0.0.0:3000");
});



// const scrapsManager = require("./scrapsManager");

// // Initialisation des projectiles
// let projectiles = [];

// setInterval(() => {
//   scrapsManager.updateScraps();
// }, 1000);

// let players = [];

// io.on("connection", (socket) => {
//   console.log("Joueur connecté :", socket.id);

//   socket.on("joinGame", (data) => {
//     players = players.filter(p => p.id !== socket.id);

//     const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
//     const spawnPosition = {
//       x: Math.floor(Math.random() * 300),
//       y: Math.floor(Math.random() * 300)
//     };

//     players.push({
//       id: socket.id,
//       name: data.name,
//       boidsCount: 0,
//       rank: players.length + 1,
//       color: color,
//       position: spawnPosition,
//       target: spawnPosition,
//       boids: []
//     });

//     sendPlayersList();
//   });

//   socket.on("updateTarget", (target) => {
//     const player = players.find(p => p.id === socket.id);
//     if (player) {
//       player.target = target;

//       if (player.movementInterval) {
//         clearInterval(player.movementInterval);
//       }

//       const start = { ...player.position };
//       const end = target;
//       const direction = {
//         x: end.x - start.x,
//         y: end.y - start.y
//       };
//       const distance = Math.sqrt(direction.x ** 2 + direction.y ** 2);

//       direction.x /= distance;
//       direction.y /= distance;

//       const speed = player.speed || 300;

//       player.movementInterval = setInterval(() => {
//         const dt = 16 / 1000;
//         const moveDist = speed * dt;

//         const toTargetX = end.x - player.position.x;
//         const toTargetY = end.y - player.position.y;
//         const distToTarget = Math.sqrt(toTargetX ** 2 + toTargetY ** 2);

//         if (distToTarget <= moveDist) {
//           player.position = { ...end };
//           clearInterval(player.movementInterval);
//           player.movementInterval = null;
//         } else {
//           player.position.x += direction.x * moveDist;
//           player.position.y += direction.y * moveDist;
//         }
//       }, 16);
//     }
//   });

//   socket.on("disconnect", () => {
//     players = players.filter(p => p.id !== socket.id);
//     sendPlayersList();
//   });
// });

// function sendPlayersList() {
//   io.emit("playersList", players);
// }

// function chooseNewBoidTarget(boid) {
//   const angle = Math.random() * Math.PI * 2;
//   const distance = Math.random() * 150;
//   boid.targetOffset = {
//     x: Math.cos(angle) * distance,
//     y: Math.sin(angle) * distance
//   };
// }

// setInterval(() => {
//   const now = Date.now();

//   players.forEach(player => {
//     // Collision pour la sphère principale
//     scrapsManager.getScraps().forEach(scrap => {
//       const dx = player.position.x - scrap.x;
//       const dy = player.position.y - scrap.y;
//       const distance = Math.sqrt(dx * dx + dy * dy);
//       if (distance < 25) {
//         scrapsManager.collectScrap(scrap.id);
//         player.boidsCount++;
//         addBoidToPlayer(player);
//       }
//     });

//     // Déplacement des boids et collisions
//     player.boids.forEach(boid => {
//       scrapsManager.getScraps().forEach(scrap => {
//         const dx = boid.x - scrap.x;
//         const dy = boid.y - scrap.y;
//         const distance = Math.sqrt(dx * dx + dy * dy);
//         if (distance < 15) {
//           scrapsManager.collectScrap(scrap.id);
//           player.boidsCount++;
//           addBoidToPlayer(player);
//         }
//       });

//       const toTargetX = player.position.x + boid.targetOffset.x - boid.x;
//       const toTargetY = player.position.y + boid.targetOffset.y - boid.y;
//       const dist = Math.sqrt(toTargetX ** 2 + toTargetY ** 2);

//       const moveDist = boid.speed * 0.033;
//       if (dist < moveDist) {
//         boid.x = player.position.x + boid.targetOffset.x;
//         boid.y = player.position.y + boid.targetOffset.y;
//         chooseNewBoidTarget(boid);
//       } else {
//         boid.x += (toTargetX / dist) * moveDist;
//         boid.y += (toTargetY / dist) * moveDist;
//       }
//     });
//   });

//   // 💥 Détection d’ennemis et limitation de la fréquence de tir
//   players.forEach(player => {
//     player.boids.forEach(boid => {
//       players.forEach(otherPlayer => {
//         if (player.id !== otherPlayer.id) {
//           otherPlayer.boids.forEach(enemyBoid => {
//             const dx = enemyBoid.x - boid.x;
//             const dy = enemyBoid.y - boid.y;
//             const dist = Math.sqrt(dx * dx + dy * dy);
//             if (dist <= 200) {
//               if (!boid.lastShotTime || now - boid.lastShotTime >= 1000) {
//                 const speed = 200;
//                 const mag = Math.sqrt(dx * dx + dy * dy);
//                 const vx = (dx / mag) * speed;
//                 const vy = (dy / mag) * speed;
//                 projectiles.push({
//                   id: Date.now() + Math.random(),
//                   x: boid.x,
//                   y: boid.y,
//                   vx, vy,
//                   color: player.color,
//                   ownerId: player.id,
//                   spawnTime: now // ✅ Ajout pour l’autodestruction
//                 });
//                 boid.lastShotTime = now;
//               }
//             }
//           });
//         }
//       });
//     });
//   });

//   // 💥 Collision projectile / boid adverse + autodestruction après 3 secondes
//   projectiles.forEach((proj, projIndex) => {
//     const dt = 0.033;
//     proj.x += proj.vx * dt;
//     proj.y += proj.vy * dt;

//     // Suppression auto après 3 secondes
//     if (now - proj.spawnTime >= 3000) {
//       projectiles.splice(projIndex, 1);
//       return;
//     }

//     // Vérifie collision avec les boids ennemis
//     players.forEach(otherPlayer => {
//       if (otherPlayer.id !== proj.ownerId) {
//         otherPlayer.boids.forEach((enemyBoid, boidIndex) => {
//           const dx = enemyBoid.x - proj.x;
//           const dy = enemyBoid.y - proj.y;
//           const dist = Math.sqrt(dx * dx + dy * dy);
//           if (dist <= 10) { // rayon projectile + boid
//             // 💥 Supprime le boid et le projectile
//             otherPlayer.boids.splice(boidIndex, 1);
//             projectiles.splice(projIndex, 1);
//             return;
//           }
//         });
//       }
//     });
//   });

//   const safePlayers = players.map(p => ({
//     id: p.id,
//     name: p.name,
//     boidsCount: p.boidsCount,
//     rank: p.rank,
//     color: p.color,
//     position: p.position,
//     boids: p.boids.map(b => ({ x: b.x, y: b.y }))
//   }));

//   io.emit("gameState", {
//     players: safePlayers,
//     scraps: scrapsManager.getScraps(),
//     projectiles: projectiles
//   });
// }, 33);

// server.listen(3000, "0.0.0.0", () => {
//   console.log("Serveur lancé sur http://0.0.0.0:3000");
// });