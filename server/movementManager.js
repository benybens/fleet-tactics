// movementManager.js
const { HOVER_SPEED,FOLLOW_SPEED } = require("./constants");


// function updatePlayerMovement(players) {
//     players.forEach(player => {
//       if (player.target) {
//         const toTargetX = player.target.x - player.position.x;
//         const toTargetY = player.target.y - player.position.y;
//         const dist = Math.sqrt(toTargetX ** 2 + toTargetY ** 2);
//         const moveDist = FOLLOW_SPEED * 0.033; // utilise FOLLOW_SPEED pour la sphère
  
//         if (dist < moveDist) {
//           player.position.x = player.target.x;
//           player.position.y = player.target.y;
//           player.target = null;
  
//           // ⚠️ Mettez tous les boids en mode "hover"
//           player.boids.forEach(boid => {
//             boid.speed = HOVER_SPEED;
//           });
//         } else {
//           player.position.x += (toTargetX / dist) * moveDist;
//           player.position.y += (toTargetY / dist) * moveDist;
//         }
//       }
//     });
//   }
  
function updateBoidMovements(players) {
    players.forEach(player => {
      player.boids.forEach(boid => {
        const toCursorX = player.position.x - boid.x;
        const toCursorY = player.position.y - boid.y;
        const distToCursor = Math.sqrt(toCursorX ** 2 + toCursorY ** 2);
  
        // Détermine la vitesse cible en fonction de la distance au curseur
        const targetSpeed = distToCursor <= 50 ? HOVER_SPEED : FOLLOW_SPEED;
  
        // Applique un lerp à la vitesse (0.1 = facteur de lissage, à ajuster)
        boid.speed = boid.speed + (targetSpeed - boid.speed) * 0.1;
  
        const toTargetX = player.position.x + boid.targetOffset.x - boid.x;
        const toTargetY = player.position.y + boid.targetOffset.y - boid.y;
        const dist = Math.sqrt(toTargetX ** 2 + toTargetY ** 2);
  
        const moveDist = boid.speed * 0.033;
        if (dist < moveDist) {
          boid.x = player.position.x + boid.targetOffset.x;
          boid.y = player.position.y + boid.targetOffset.y;
          chooseNewBoidTarget(boid);
        } else {
          boid.x += (toTargetX / dist) * moveDist;
          boid.y += (toTargetY / dist) * moveDist;
        }
      });
    });
  }
  
  
  
  function chooseNewBoidTarget(boid) {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * (boid.radius || 50); // 👈 utilise la valeur dynamique si dispo
    boid.targetOffset = {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance
    };
  }
  
  module.exports = {
    updateBoidMovements
  };
  