const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    backgroundColor: "#333333",
    scene: {
      create: create,
      update: update
    }
  };
  
  const game = new Phaser.Game(config);
  
  let teams = {
    blue: [],
    red: [],
    yellow: [],
    green: []
  };
  let teamColors = {
    blue: 0x0000ff,
    red: 0xff0000,
    yellow: 0xffff00,
    green: 0x00ff00
  };
  let playerTeam = "blue";
  let targets = {};
  let maxDistance = 100;
  
  let bonuses = [];
  let lasers = [];
  const shootCooldown = 1000;
  const shootDistance = 200;
  
  function create() {
    this.cameras.main.centerOn(450, 450);
    this.cameras.main.setZoom(0.2);
  
    this.cursors = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });
  
    // Créer les cibles de zone pour chaque équipe
    for (const team in teams) {
      targets[team] = new Phaser.Math.Vector2(
        Phaser.Math.Between(100, 800),
        Phaser.Math.Between(100, 800)
      );
      const color = teamColors[team];
      this.add.circle(targets[team].x, targets[team].y, 20, color, 0.5);
      this.add.circle(targets[team].x, targets[team].y, maxDistance, color, 0.2).setStrokeStyle(2, color);
  
      // Spawn initial
      for (let i = 0; i < 5; i++) {
        addBoid(this, team, targets[team]);
      }
    }
  
    // Spawner un bonus toutes les secondes
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        spawnBonus(this);
      },
      loop: true
    });
  
    // Déplacer la cible bleue avec clic gauche
    this.input.on("pointerdown", (pointer) => {
      if (pointer.leftButtonDown()) {
        const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
        targets[playerTeam].set(worldPoint.x, worldPoint.y);
      }
    });
  
    // Zoom
    this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
      const cam = this.cameras.main;
      const zoomSpeed = 0.001;
      let newZoom = cam.zoom - deltaY * zoomSpeed;
      newZoom = Phaser.Math.Clamp(newZoom, 0.1, 2);
      const worldX = cam.scrollX + pointer.x / cam.zoom;
      const worldY = cam.scrollY + pointer.y / cam.zoom;
      cam.setZoom(newZoom);
      cam.scrollX = worldX - pointer.x / newZoom;
      cam.scrollY = worldY - pointer.y / newZoom;
    });
  }
  
  function update(time, delta) {
    // Déplacer la caméra
    const cam = this.cameras.main;
    const camSpeed = 5 / cam.zoom;
    if (this.cursors.up.isDown) cam.scrollY -= camSpeed;
    if (this.cursors.down.isDown) cam.scrollY += camSpeed;
    if (this.cursors.left.isDown) cam.scrollX -= camSpeed;
    if (this.cursors.right.isDown) cam.scrollX += camSpeed;
  
    // Update des boids
    for (const team in teams) {
      updateBoids(this, teams[team], team, delta);
    }
  
    // Update des lasers
    lasers.forEach((laser, index) => {
      laser.lifeTime += delta;
      if (laser.lifeTime > 3000) {
        laser.sprite.destroy();
        lasers.splice(index, 1);
        return;
      }
      laser.sprite.x += laser.direction.x * laser.speed;
      laser.sprite.y += laser.direction.y * laser.speed;
  
      const distance = Phaser.Math.Distance.Between(
        laser.sprite.x, laser.sprite.y,
        laser.target.sprite.x, laser.target.sprite.y
      );
      if (distance < 10) {
        laser.target.hitCount = (laser.target.hitCount || 0) + 1;
        laser.sprite.destroy();
        lasers.splice(index, 1);
        if (laser.target.hitCount >= 2) {
          spawnDeathParticles(this, laser.target.sprite.x, laser.target.sprite.y);
          laser.target.sprite.destroy();
          const teamArr = teams[laser.target.team];
          teamArr.splice(teamArr.indexOf(laser.target), 1);
        }
      }
    });
  }
  
  function addBoid(scene, team, targetZone) {
    const color = teamColors[team];
    const ship = scene.add.circle(targetZone.x, targetZone.y, 10, color);
    const forwardVector = new Phaser.Math.Vector2(0, -1);
    const boid = {
      sprite: ship,
      team: team,
      forwardVector: forwardVector,
      motorSpeed: 2,
      randomDestination: getRandomPointInCircle(targetZone, maxDistance),
      changeDestinationTimer: 0,
      destinationDuration: 2000,
      shootTimer: 0,
      isReturning: false
    };
    teams[team].push(boid);
  }
  
  function updateBoids(scene, boids, team, delta) {
    boids.forEach(boid => {
      const shipPos = new Phaser.Math.Vector2(boid.sprite.x, boid.sprite.y);
      const zoneCenter = targets[team];
      const innerRadius = maxDistance - 10;
      const distanceToTarget = shipPos.distance(zoneCenter);
  
      // Revenir dans le cercle si sorti
      if (distanceToTarget > maxDistance) boid.isReturning = true;
      else if (distanceToTarget < innerRadius) boid.isReturning = false;
  
      let targetPoint;
      if (boid.isReturning) {
        targetPoint = zoneCenter;
      } else {
        // Chercher un bonus proche
        let bonusTarget = bonuses.find(b => Phaser.Math.Distance.Between(boid.sprite.x, boid.sprite.y, b.x, b.y) < 200);
        if (bonusTarget) {
          targetPoint = bonusTarget;
        } else {
          // Chercher un ennemi plus faible
          let weakestTeam = findWeakestTeam(team);
          if (weakestTeam && weakestTeam !== team) {
            let targetBoid = teams[weakestTeam][0];
            if (targetBoid) targetPoint = targetBoid.sprite;
          } else {
            // Random hover
            boid.changeDestinationTimer += delta;
            if (boid.changeDestinationTimer > boid.destinationDuration) {
              boid.randomDestination = getRandomPointInCircle(zoneCenter, maxDistance);
              boid.changeDestinationTimer = 0;
            }
            targetPoint = boid.randomDestination;
          }
        }
      }
  
      const toTarget = new Phaser.Math.Vector2(targetPoint.x - boid.sprite.x, targetPoint.y - boid.sprite.y).normalize();
      boid.forwardVector = toTarget;
      boid.sprite.x += boid.forwardVector.x * boid.motorSpeed;
      boid.sprite.y += boid.forwardVector.y * boid.motorSpeed;
  
      // Tirer si un ennemi proche
      boid.shootTimer += delta;
      if (boid.shootTimer > shootCooldown) {
        for (const otherTeam in teams) {
          if (otherTeam !== team) {
            teams[otherTeam].forEach(enemy => {
              const distance = Phaser.Math.Distance.Between(boid.sprite.x, boid.sprite.y, enemy.sprite.x, enemy.sprite.y);
              if (distance < shootDistance) {
                shootLaser(scene, boid, enemy, team);
                boid.shootTimer = 0;
              }
            });
          }
        }
      }
    });
  }
  
  function findWeakestTeam(excludeTeam) {
    let weakest = null;
    let min = Infinity;
    for (const team in teams) {
      if (team !== excludeTeam && teams[team].length < min && teams[team].length > 0) {
        min = teams[team].length;
        weakest = team;
      }
    }
    return weakest;
  }
  
  function shootLaser(scene, shooter, target, team) {
    const laserColors = {
      blue: 0x00ccff,
      red: 0xaa00ff,
      yellow: 0xff00ff,
      green: 0xff9900
    };
    const laser = scene.add.circle(shooter.sprite.x, shooter.sprite.y, 4, laserColors[team]);
    const dir = new Phaser.Math.Vector2(target.sprite.x - shooter.sprite.x, target.sprite.y - shooter.sprite.y).normalize();
    lasers.push({
      sprite: laser,
      direction: dir,
      speed: 5,
      shooter: shooter,
      target: target,
      lifeTime: 0
    });
  }
  
  function getRandomPointInCircle(center, radius) {
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const distance = Phaser.Math.FloatBetween(0, radius);
    return new Phaser.Math.Vector2(
      center.x + Math.cos(angle) * distance,
      center.y + Math.sin(angle) * distance
    );
  }
  
  function spawnBonus(scene) {
    const bonus = scene.add.rectangle(
      Phaser.Math.Between(50, 850),
      Phaser.Math.Between(50, 850),
      10, 10,
      0x0000ff
    );
    bonuses.push(bonus);
  }
  
  function spawnDeathParticles(scene, x, y, count = 10) {
    for (let i = 0; i < count; i++) {
      const particle = scene.add.circle(x, y, 2, 0xffa500);
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const direction = new Phaser.Math.Vector2(Math.cos(angle), Math.sin(angle));
      scene.tweens.add({
        targets: particle,
        x: x + direction.x * 30,
        y: y + direction.y * 30,
        alpha: 0,
        duration: 500,
        onComplete: () => { particle.destroy(); }
      });
    }
  }
  