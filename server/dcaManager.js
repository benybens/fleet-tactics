const dcaList = [];
const { createProjectile } = require("./projectileManager");
const { MAP_SIZE } = require("./constants");


let DCA_RADIUS = 200;
let DCA_SHOOT_INTERVAL = 2000;
let DCA_PROJECTILE_SPEED = 100;

function generateDCA(density) {
  const nbDCA = Math.floor((density / 100) * 100);
  const MIN_DISTANCE = 40;

  while (dcaList.length < nbDCA) {
    const newDCA = {
      x: Math.random() * MAP_SIZE,
      y: Math.random() * MAP_SIZE,
      lastShot: 0
    };

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

// 💡 Ajoute cette fonction pour spawn un nouveau DCA unique
function spawnSingleDCA() {
  const newDCA = {
    x: Math.random() * MAP_SIZE,
    y: Math.random() * MAP_SIZE,
    lastShot: 0
  };

  const MIN_DISTANCE = 40;
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
    console.log("💥 Nouveau DCA ajouté :", newDCA);
  } else {
    console.log("❌ Overlap, DCA non ajouté");
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
            createProjectile(
              { x: dca.x, y: dca.y },
              { x: boid.x, y: boid.y },
              "#ff0000",
              "dca",
              DCA_PROJECTILE_SPEED
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

function resetDCA(density) {
  dcaList.length = 0;
  generateDCA(density);
}

// 💡 Ajoute cette ligne pour lancer le spawn automatique
setInterval(spawnSingleDCA, 5000); // toutes les 5 secondes

module.exports = {
  generateDCA,
  updateDCA,
  getDCA,
  resetDCA
};
