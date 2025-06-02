// mapManager.js
const { createNoise2D } = require("simplex-noise");
const { MAP_SIZE } = require("./constants");

const noise2D = createNoise2D();


const WIDTH = MAP_SIZE;
const HEIGHT = MAP_SIZE;
const SCALE = 0.01;

function generateHeightMap() {
  const heightMap = [];
  for (let y = 0; y < HEIGHT; y++) {
    const row = [];
    for (let x = 0; x < WIDTH; x++) {
      let nx = x * SCALE;
      let ny = y * SCALE;
      let elevation = noise2D(nx, ny) * 0.5 + 0.5; // 0-1
      elevation = Math.pow(elevation, 1.5); // accentuer les sommets
      row.push(elevation);
    }
    heightMap.push(row);
  }
  return heightMap;
}

module.exports = { generateHeightMap, WIDTH, HEIGHT };
