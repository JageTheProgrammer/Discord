// commands/fun/rank.js
import { SlashCommandBuilder } from 'discord.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('Shows your rank and XP.'),
  async execute(interaction) {
    const userId = interaction.user.id;
    const ranksPath = path.join(__dirname, '../../database/ranks.json');
    let ranks = {};

    try {
      const data = readFileSync(ranksPath, 'utf8');
      ranks = JSON.parse(data || '{}');
    } catch (error) {
      console.error('Error reading ranks.json:', error);
    }

    if (!ranks[userId]) {
      ranks[userId] = { xp: 0, level: 1 };
    }

    const xp = ranks[userId].xp;
    const level = ranks[userId].level;

    try {
      await interaction.reply({ content: `Your rank: Level ${level}, XP: ${xp}`, ephemeral: true });
    } catch (error) {
      console.error('Error showing rank:', error);
      await interaction.reply({ content: 'There was an error showing your rank.', ephemeral: true });
    }
  },
  cooldown: 10,
};