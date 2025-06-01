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
    const index = players.findIndex(p => p.id === socket.id);
    if (index !== -1) players.splice(index, 1);

    const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
    const spawnPosition = { x: Math.random() * 300, y: Math.random() * 300 };
  
    players.push({
      id: socket.id,
      name: data.name,
      boidsCount: 0,
      rank: players.length + 1,
      color: color,
      position: spawnPosition,
      target: spawnPosition,
      boids: []
    });
  }

  function handleUpdateTarget(socket, target) {
    const player = players.find(p => p.id === socket.id);
    if (player) {
      player.target = target;
    }
  }

  function handleDisconnect(socket) {
    const index = players.findIndex(p => p.id === socket.id);
      if (index !== -1) players.splice(index, 1);
  }
  
  module.exports = { initPlayerManager, handleJoin, handleUpdateTarget, handleDisconnect, players };