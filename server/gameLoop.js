// gameLoop.js
const { players, addBoidToPlayer } = require("./playerManager");
const { updateScraps, getScraps } = require("./scrapsManager");
const { updatePlayerMovement, updateBoidMovements } = require("./movementManager");
const { updateProjectiles, getProjectiles } = require("./projectileManager");
const { 
  checkPlayerScrapCollision, 
  checkBoidScrapCollision, 
  checkProjectileBoidCollision 
} = require("./collisionManager");

function updateGame(io) {
  setInterval(() => {
    updateScraps();
    updatePlayerMovement(players);
    updateBoidMovements(players);

    players.forEach(player => {
      checkPlayerScrapCollision(player);
      checkBoidScrapCollision(player, addBoidToPlayer);
    });

    // ✅ Récupération directe des projectiles
    const projectiles = getProjectiles();
    checkProjectileBoidCollision(projectiles, players);
    updateProjectiles(players);

    const safePlayers = players.map(p => ({
      id: p.id,
      name: p.name,
      boidsCount: p.boidsCount,
      rank: p.rank,
      color: p.color,
      position: p.position,
      boids: p.boids.map(b => ({ x: b.x, y: b.y }))
    }));

    io.emit("gameState", {
        players: safePlayers,
        scraps: getScraps(),
        projectiles: require("./projectileManager").getProjectiles()
      });
  }, 33);
}

module.exports = { updateGame };
