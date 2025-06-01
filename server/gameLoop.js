// gameLoop.js
const { players } = require("./playerManager");
const { updateScraps, getScraps } = require("./scrapsManager");
const { addBoidToPlayer } = require("./boidManager");
const { updatePlayerMovement, updateBoidMovements } = require("./movementManager");
const { updateProjectiles, getProjectiles,createProjectile } = require("./projectileManager");
const { 
  checkPlayerScrapCollision, 
  checkBoidScrapCollision, 
  checkProjectileBoidCollision 
} = require("./collisionManager");
const dcaManager = require("./dcaManager");



function updateGame(io) {
  setInterval(() => {
    updateScraps();
    updateBoidMovements(players);

    players.forEach(player => {
        // checkPlayerScrapCollision(player, addBoidToPlayer);
        checkBoidScrapCollision(player, addBoidToPlayer);
  
        // Ajoute la logique de tir pour chaque boid !
        const now = Date.now();
        player.boids.forEach(boid => {
          if (!boid.lastShotTime || now - boid.lastShotTime >= 1000) {
            // Trouve la cible la plus proche d’un autre joueur
            let closestEnemy = null;
            let closestDist = Infinity;
            players.forEach(other => {
              if (other.id !== player.id) {
                other.boids.forEach(enemyBoid => {
                  const dx = enemyBoid.x - boid.x;
                  const dy = enemyBoid.y - boid.y;
                  const dist = Math.sqrt(dx * dx + dy * dy);
                  if (dist < 200 && dist < closestDist) { // rayon de 200 pour engagement
                    closestEnemy = enemyBoid;
                    closestDist = dist;
                  }
                });
              }
            });
  
            if (closestEnemy) {
              createProjectile(boid, closestEnemy, player.color, player.id);
              boid.lastShotTime = now;
            }
          }
        });
      });

  dcaManager.updateDCA(players);
    

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

    // const gameState = {
    //     players: safePlayers,
    //     scraps: getScraps(),
    //     projectiles: require("./projectileManager").getProjectiles(),
    //     dca: dcaManager.getDCA()
    //   };
      
    //   // 🚀 DEBUG : vérifie le gameState
    //   console.log("🟢 gameState envoyé au client:", JSON.stringify(gameState, null, 2));
      

    io.emit("gameState", {
        players: safePlayers,
        scraps: getScraps(),
        projectiles: require("./projectileManager").getProjectiles(), // 👈 pas de dcaManager.getDCAProjectiles
        dca: dcaManager.getDCA() // 👈 Tu peux continuer à envoyer la liste des DCA pour les dessiner
      });
      
  }, 33);


}

module.exports = { updateGame };
