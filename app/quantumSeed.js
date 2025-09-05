const axios = require('axios');
const mulberry32 = require('./pseudoRNG');

let rand = Math.random; // fallback
let seedValue = 0;

// Atualiza a seed quântica da ANU com retries
async function refreshQuantumSeed(retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await axios.get('https://qrng.anu.edu.au/API/jsonI.php?length=1&type=hex16', { timeout: 5000 });
            if (!response.data || !response.data.data || !response.data.data[0]) {
                throw new Error('Resposta inválida da API QRNG');
            }
            const hash = response.data.data[0];
            seedValue = parseInt(hash, 16);
            rand = mulberry32(seedValue);
            console.log(`Quantum seed refreshed: ${seedValue}`);
            return;
        } catch (error) {
            console.warn(`[QRNG] Tentativa ${attempt} falhou:`, error.response?.status || error.message);
            await new Promise(res => setTimeout(res, 2000)); // espera 2s antes de tentar novamente
        }
    }
    console.warn('[QRNG] Usando fallback local (Math.random)');
    rand = Math.random;
}

// Gera número aleatório entre 1 e max
function getQuantumRandom(max) {
    return Math.floor(rand() * max) + 1;
}

// Atualiza a seed a cada 4 minutos
setInterval(refreshQuantumSeed, 240_000);

module.exports = { 
    refreshQuantumSeed,
    getQuantumRandom
};