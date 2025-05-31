const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// On sert le dossier public
app.use(express.static("public"));

// Connexion d'un joueur
io.on("connection", (socket) => {
  console.log("Un joueur connecté :", socket.id);

  // Exemple : ping-pong
  socket.on("ping", () => {
    console.log("Ping reçu !");
    socket.emit("pong");
  });

  socket.on("disconnect", () => {
    console.log("Joueur déconnecté :", socket.id);
  });
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
