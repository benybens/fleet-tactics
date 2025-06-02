// server/scrapsManager.js
const MAX_SCRAPS = 100;
const { MAP_SIZE } = require("./constants");


let scraps = [];

function generateRandomScrap() {
  return {
    id: Date.now() + Math.random(), // identifiant unique
    x: Math.floor(Math.random() * MAP_SIZE),
    y: Math.floor(Math.random() * MAP_SIZE)
  };
}

function updateScraps() {
  if (scraps.length < MAX_SCRAPS) {
    scraps.push(generateRandomScrap());
  }
}

function collectScrap(scrapId) {
  scraps = scraps.filter(s => s.id !== scrapId);
}

function getScraps() {
  return scraps;
}

module.exports = {
  updateScraps,
  collectScrap,
  getScraps
};
