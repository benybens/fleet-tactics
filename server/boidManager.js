// boidManager.js

function addBoidToPlayer(player) {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 50;
    const speed = (player.speed || 300) / 2;
  
    const dynamicRadius = 30 + (player.boids.length * 2); // 💡 ton calcul dynamique
  
    player.boids.push({
      x: player.position.x + Math.cos(angle) * distance,
      y: player.position.y + Math.sin(angle) * distance,
      targetOffset: { x: 0, y: 0 },
      speed: speed,
      radius: dynamicRadius, // 👈 Ajoute la valeur dynamique
      lastShotTime: 0
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
  