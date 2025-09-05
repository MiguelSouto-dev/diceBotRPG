require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { getQuantumRandom, refreshQuantumSeed } = require('./quantumSeed');

const client = new Client({
  intents: Object.values(GatewayIntentBits)
});

// Bot conectado
client.once('ready', () => {
  console.log(`🤖 Bot conectado como ${client.user.tag}`);
});

// Comando de rolagem de dados
client.on('messageCreate', (message) => {
  if (message.author.bot) return;

  const content = message.content.toLowerCase();

  // Comando estilo RPG: !d20, !2d6, !15d100
  if (content.startsWith('!')) {
    const diceCommand = content.slice(1); // remove "!"

    // Regex para capturar "XdY" ou "dY"
    const match = diceCommand.match(/^(\d*)d(\d+)([+\-*/]\d+)?$/);
    if (!match) return; // não é um comando de dado válido

    let numDice = parseInt(match[1]) || 1;
    const max = parseInt(match[2]);
    const operation = match[3];

    if (isNaN(numDice) || numDice < 1) numDice = 1;
    if (isNaN(max) || max < 2) return message.reply('O número do dado deve ser >= 2');

    // Limites práticos para não travar o bot
    if (numDice > 50) return message.reply('Não pode rolar mais de 50 dados de uma vez');
    if (max > 10000) return message.reply('O número de lados não pode ser maior que 10.000');

    // Rola os dados
    const rolls = [];
for (let i = 0; i < numDice; i++) {
    let roll = getQuantumRandom(max);
    if (operation) {
        const op = operation[0];
        const value = parseInt(operation.slice(1));
        switch (op) {
            case '+': roll += value; break;
            case '-': roll -= value; break;
            case '*': roll *= value; break;
            case '/': roll = Math.floor(roll / value); break;
        }
    }
    // Garante que o valor mínimo é 1
    roll = Math.max(1, roll);
    rolls.push(roll);
}
}

    const total = rolls.reduce((a, b) => a + b, 0);
    message.reply(`🎲 Rolagem: [${rolls.join(', ')}] (Total: ${total})`);
    });

// Inicializa seed quântica
refreshQuantumSeed();

// Login do bot
client.login(process.env.DISCORD_TOKEN);
