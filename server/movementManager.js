// movementManager.js

function updatePlayerMovement(players) {
    players.forEach(player => {
      if (player.target) {
        const toTargetX = player.target.x - player.position.x;
        const toTargetY = player.target.y - player.position.y;
        const dist = Math.sqrt(toTargetX ** 2 + toTargetY ** 2);
        const moveDist = 300 * 0.033; // par ex. vitesse=300 px/sec
  
        if (dist < moveDist) {
          player.position.x = player.target.x;
          player.position.y = player.target.y;
          player.target = null;
        } else {
          player.position.x += (toTargetX / dist) * moveDist;
          player.position.y += (toTargetY / dist) * moveDist;
        }
      }
    });
  }
  
  function updateBoidMovements(players) {
    players.forEach(player => {
      player.boids.forEach(boid => {
        const toTargetX = player.position.x + boid.targetOffset.x - boid.x;
        const toTargetY = player.position.y + boid.targetOffset.y - boid.y;
        const dist = Math.sqrt(toTargetX ** 2 + toTargetY ** 2);
  
        const moveDist = boid.speed * 0.033;
        if (dist < moveDist) {
          boid.x = player.position.x + boid.targetOffset.x;
          boid.y = player.position.y + boid.targetOffset.y;
          chooseNewBoidTarget(boid); // Appelera la version modifiée 👇
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
    updatePlayerMovement,
    updateBoidMovements
  };
  