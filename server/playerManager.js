const colorPalette = [
    "#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF",
    "#FF6EC7", "#00B8A9", "#FFC300", "#845EC2"
  ];    

  const players = [];

function initPlayerManager(io) {
  // Exporté pour le gameLoop
  module.exports.players = players;
}

function handleJoin(socket, data) {
    const existingIndex = players.findIndex(p => p.id === socket.id);
    if (existingIndex !== -1) {
      players.splice(existingIndex, 1);
    }
  
    const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
    const spawnPosition = { x: Math.random() * 300, y: Math.random() * 300 };
  
    const player = {
      id: socket.id,
      name: data.name,
      boidsCount: 0,
      rank: players.length + 1,
      color: color,
      position: spawnPosition,
      target: spawnPosition,
      boids: []
    };
  
    players.push(player);
  
    const { addBoidToPlayer } = require("./boidManager");
    for (let i = 0; i < 3; i++) {
      addBoidToPlayer(player);
    }
  }
  

  function handleUpdateTarget(socket, target) {
    const player = players.find(p => p.id === socket.id);
    if (player) {
      player.position.x = target.x;
      player.position.y = target.y;
      // Pas besoin de target si c’est un téléport instantané
    }
  }

  function handleDisconnect(socket) {
    const index = players.findIndex(p => p.id === socket.id);
    if (index !== -1) {
      players.splice(index, 1);
    }
  }
  
  module.exports = { initPlayerManager, handleJoin, handleUpdateTarget, handleDisconnect, players };