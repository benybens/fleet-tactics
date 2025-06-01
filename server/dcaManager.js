// dcaManager.js
const dcaList = [];
const { createProjectile } = require("./projectileManager");

let DCA_RADIUS = 200; // rayon de détection
let DCA_SHOOT_INTERVAL = 2000; // 0.5 tir/seconde = 2000 ms
let DCA_PROJECTILE_SPEED = 100; // 👈 vitesse spécifique pour les projectiles DCA

function generateDCA(density) {
  const nbDCA = Math.floor((density / 100) * 100); // Ajuste si besoin
  const MIN_DISTANCE = 40; // 30 + buffer de 10 px

  while (dcaList.length < nbDCA) {
    const newDCA = {
      x: Math.random() * 300,
      y: Math.random() * 300,
      lastShot: 0
    };

    // Vérifie la distance avec les DCA existants
    let overlap = false;
    for (let dca of dcaList) {
      const dx = newDCA.x - dca.x;
      const dy = newDCA.y - dca.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MIN_DISTANCE) {
        overlap = true;
        break;
      }
    }

    if (!overlap) {
      dcaList.push(newDCA);
    }
  }
}

function updateDCA(players) {
  const now = Date.now();
  dcaList.forEach(dca => {
    players.forEach(player => {
      player.boids.forEach(boid => {
        const dx = boid.x - dca.x;
        const dy = boid.y - dca.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= DCA_RADIUS) {
          if (!dca.lastShot || now - dca.lastShot >= DCA_SHOOT_INTERVAL) {
            // 💥 Crée un projectile DCA avec la vitesse spécifique
            createProjectile(
              { x: dca.x, y: dca.y }, // from
              { x: boid.x, y: boid.y }, // target
              "#ff0000",                // couleur rouge
              "dca",                    // ownerId
              DCA_PROJECTILE_SPEED      // 👈 vitesse spécifique
            );
            dca.lastShot = now;
          }
        }
      });
    });
  });
}

function getDCA() {
  return dcaList;
}

module.exports = {
  generateDCA,
  updateDCA,
  getDCA
};
