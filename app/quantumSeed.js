const axios = require('axios');
const mulberry32 = require('./pseudoRNG');

let rand = Math.random;
let seedValue = 0;

// Atualiza a seed quântica da API DA ANU
async function refreshQuantumSeed() {
    try {
        const response = await axios.get('https://qrng.anu.edu.au/API/jsonI.php?length=1&type=hex16');
        if (!response.data || !response.data.data || !response.data.data[0]) {
            throw new Error('Resposta inesperada da API QRNG');
        }
        const hash = response.data.data[0];
        seedValue = parseInt(hash, 16);
        rand = mulberry32(seedValue);
        console.log(`Quantum seed refreshed: ${seedValue}`);
    } 
    catch (error) {
        console.error('Error fetching quantum seed:', error);
        rand = Math.random;
    }
}


// Gera número aleatório entre 1 e max
function getQuantumRandom(max) {
  return Math.floor(rand() * max) + 1;
}


// Atualiza a seed a cada 240 segundos
setInterval(refreshQuantumSeed, 240_000);


module.exports = { 
    refreshQuantumSeed,
    getQuantumRandom};