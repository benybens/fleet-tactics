// collisionManager.js

const scrapsManager = require("./scrapsManager");

function checkPlayerScrapCollision(player,addBoidCallback) {
  scrapsManager.getScraps().forEach(scrap => {
    const dx = player.position.x - scrap.x;
    const dy = player.position.y - scrap.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < 25) { // Rayon sphère principale + demi-largeur scrap
      scrapsManager.collectScrap(scrap.id);
      player.boidsCount++;
      addBoidCallback(player);
      return true; // Indique qu’un scrap a été collecté
    }
  });
}

function checkBoidScrapCollision(player, addBoidCallback) {
  player.boids.forEach(boid => {
    scrapsManager.getScraps().forEach(scrap => {
      const dx = boid.x - scrap.x;
      const dy = boid.y - scrap.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 15) { // Rayon boid + demi-largeur scrap
        scrapsManager.collectScrap(scrap.id);
        player.boidsCount++;
        addBoidCallback(player);
      }
    });
  });
}

function checkProjectileBoidCollision(projectiles, players) {
  const now = Date.now();
  projectiles.forEach((proj, projIndex) => {
    // Suppression automatique après 3 secondes
    if (now - proj.spawnTime >= 3000) {
      projectiles.splice(projIndex, 1);
      return;
    }

    // Vérifie la collision avec les boids ennemis
    players.forEach(otherPlayer => {
      if (otherPlayer.id !== proj.ownerId) {
        otherPlayer.boids.forEach((enemyBoid, boidIndex) => {
          const dx = enemyBoid.x - proj.x;
          const dy = enemyBoid.y - proj.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance <= 10) { // Rayon projectile + boid
            // Supprime le boid et le projectile
            otherPlayer.boids.splice(boidIndex, 1);
            projectiles.splice(projIndex, 1);
            return;
          }
        });
      }
    });
  });
}

module.exports = {
  checkPlayerScrapCollision,
  checkBoidScrapCollision,
  checkProjectileBoidCollision
};