import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Shows the server leaderboard based on XP.'),
  async execute(interaction) {
    const ranksPath = path.join(__dirname, '../../database/ranks.json');

    try {
      const data = readFileSync(ranksPath, 'utf8');
      let ranks = JSON.parse(data || '{}');

      if (Object.keys(ranks).length === 0) {
        return await interaction.reply({ content: 'No users have earned any XP yet!', ephemeral: true });
      }

      const sortedRanks = Object.entries(ranks)
        .sort(([, a], [, b]) => b.xp - a.xp)
        .slice(0, 10);

      let leaderboardString = '';
      for (let i = 0; i < sortedRanks.length; i++) {
        const userId = sortedRanks[i][0];
        const xp = sortedRanks[i][1].xp;
        const level = sortedRanks[i][1].level;

        try {
          const user = await interaction.client.users.fetch(userId);
          leaderboardString += `${i + 1}. ${user.tag} - Level ${level}, XP: ${xp}\n`;
        } catch (userError) {
          console.error(`Error fetching user ${userId}:`, userError);
          leaderboardString += `${i + 1}. User ID ${userId} (Error fetching user) - Level ${level}, XP: ${xp}\n`;
        }
      }

      const embed = new EmbedBuilder()
        .setTitle('Server Leaderboard')
        .setDescription(leaderboardString || 'No users on the leaderboard.')
        .setColor('#0099ff')
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error retrieving leaderboard:', error);
      await interaction.reply({ content: 'There was an error retrieving the leaderboard. Please try again later.', ephemeral: true });
    }
  },
  cooldown: 10,
};