// boidManager.js

const { HOVER_SPEED } = require("./constants");

function addBoidToPlayer(player) {
    if (player.boids.length >= 10) {
      console.log(`⛔ Le joueur ${player.name} a déjà 10 boids (max atteint)`);
      return; // Ne pas ajouter
    }
  
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 50;
  
    player.boids.push({
      x: player.position.x + Math.cos(angle) * distance,
      y: player.position.y + Math.sin(angle) * distance,
      targetOffset: {
        x: 0, // sera défini par chooseNewBoidTarget
        y: 0
      },
      speed: HOVER_SPEED
    });
    console.log(`✅ Boid ajouté à ${player.name}. Total: ${player.boids.length}`);
  }
function adjustBoidRadius(player) {
    const baseDistance = 30;
    const extraPerBoid = 1.01;
    const totalBoids = player.boids.length;
  
    // Calcule le rayon dynamique final
    const radius = baseDistance + (totalBoids * extraPerBoid);
  
    player.boids.forEach(boid => {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * radius;
      boid.targetOffset = {
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance
      };
    });
  }
  
  module.exports = { addBoidToPlayer,adjustBoidRadius };
  