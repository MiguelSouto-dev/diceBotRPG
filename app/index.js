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

  if (content.startsWith('!')) {
    const diceCommand = content.slice(1);
    const match = diceCommand.match(/^(\d*)d(\d+)([+\-*/]\d+)?$/);
    if (!match) return;

    let numDice = parseInt(match[1]) || 1;
    const max = parseInt(match[2]);
    const operation = match[3];

    // Se existir operação (+3, -2, etc.), extrai valor
    let op = null;
    let value = 0;
    if (operation) {
      op = operation[0];
      value = parseInt(operation.slice(1));
    }
    
    if (numDice < 1) numDice = 1;
    if (max < 2) return message.reply('O número do dado deve ser >= 2');
    if (numDice > 50) return message.reply('Não pode rolar mais de 50 dados de uma vez');
    if (max > 10000) return message.reply('O número de lados não pode ser maior que 10.000');

    const rolls = [];
    for (let i = 0; i < numDice; i++) {
      let roll = getQuantumRandom(max);

      if (op) {
        switch (op) {
          case '+': roll += value; break;
          case '-': roll -= value; break;
          case '*': roll *= value; break;
          case '/': roll = Math.floor(roll / value); break;
        }
      }

      roll = Math.max(1, roll); // nunca menor que 1
      rolls.push(roll);
    }

    const total = rolls.reduce((a, b) => a + b, 0);

  
    let opText = op ? ` ${op}${value}` : '';
    message.reply(`🎲 Rolagem: ${numDice}d${max}${opText} → [${rolls.join(', ')}] (Total: ${total})`);
  }
});

// Inicializa seed quântica
refreshQuantumSeed();

// Login do bot
client.login(process.env.DISCORD_TOKEN);
