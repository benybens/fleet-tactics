// projectileManager.js
const projectiles = [];
let defaultProjectileSpeed = 200; // vitesse par défaut si non spécifiée

function createProjectile(from, target, color, ownerId, speed = defaultProjectileSpeed) {
  const dx = target.x - from.x;
  const dy = target.y - from.y;
  const mag = Math.sqrt(dx * dx + dy * dy);

  const vx = (dx / mag) * speed;
  const vy = (dy / mag) * speed;

  projectiles.push({
    id: Date.now() + Math.random(),
    x: from.x,
    y: from.y,
    vx, vy,
    color: color,
    ownerId: ownerId,
    spawnTime: Date.now()
  });
}

function updateProjectiles(players) {
  const now = Date.now();
  const dt = 0.033;

  projectiles.forEach((proj, index) => {
    proj.x += proj.vx * dt;
    proj.y += proj.vy * dt;

    // Suppression après 3 secondes
    if (now - proj.spawnTime >= 3000) {
      projectiles.splice(index, 1);
      return;
    }

    // Collision avec les boids ennemis
    players.forEach(player => {
      if (player.id !== proj.ownerId) {
        player.boids.forEach((boid, boidIndex) => {
          const dx = boid.x - proj.x;
          const dy = boid.y - proj.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist <= 10) {
            // 💥 Supprime le boid et le projectile
            player.boids.splice(boidIndex, 1);
            projectiles.splice(index, 1);
            return;
          }
        });
      }
    });
  });
}

function getProjectiles() {
  return projectiles;
}

module.exports = { createProjectile, updateProjectiles, getProjectiles };
