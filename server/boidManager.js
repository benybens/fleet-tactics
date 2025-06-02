// boidManager.js

const { HOVER_SPEED } = require("./constants");

function addBoidToPlayer(player) {
    // Limite à 10 boids maximum
    if (player.boids.length >= 10) return;
  
    // ✅ Calcule la position moyenne de tous les boids existants
    let avgX = player.position.x;
    let avgY = player.position.y;
    if (player.boids.length > 0) {
      avgX = player.boids.reduce((sum, b) => sum + b.x, 0) / player.boids.length;
      avgY = player.boids.reduce((sum, b) => sum + b.y, 0) / player.boids.length;
    }
  
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 50;
  
    const targetAngle = Math.random() * Math.PI * 2;
    const targetDist = Math.random() * 50;
    player.boidsCount++;
    player.boids.push({
      x: avgX + Math.cos(angle) * distance,
      y: avgY + Math.sin(angle) * distance,
      targetOffset: {
        x: Math.cos(targetAngle) * targetDist,
        y: Math.sin(targetAngle) * targetDist
      },
      speed: HOVER_SPEED // Par défaut en mode hover
    });
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
  