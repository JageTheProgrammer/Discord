// commands/fun/leaderboard.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Shows the server leaderboard based on XP.'),
    async execute(interaction) {
        const ranksPath = path.join(__dirname, '../../database/ranks.json');

        try {
            // 1. Read and Parse the Ranks Data
            const data = fs.readFileSync(ranksPath, 'utf8');
            let ranks = JSON.parse(data);

            // 2. Check if there's any data
            if (Object.keys(ranks).length === 0) {
                return await interaction.reply({ content: 'No users have earned any XP yet!', ephemeral: true });
            }

            // 3. Sort the Ranks by XP (Descending)
            const sortedRanks = Object.entries(ranks)
                .sort(([, a], [, b]) => b.xp - a.xp) // Sort by XP in descending order
                .slice(0, 10); // Limit to the top 10 users

            // 4. Build the Leaderboard String
            let leaderboardString = '';
            for (let i = 0; i < sortedRanks.length; i++) {
                const userId = sortedRanks[i][0];
                const xp = sortedRanks[i][1].xp;
                const level = sortedRanks[i][1].level;

                // Fetch the user's tag (username#discriminator)
                try {
                    const user = await interaction.client.users.fetch(userId);
                    leaderboardString += `${i + 1}. ${user.tag} - Level ${level}, XP: ${xp}\n`;
                } catch (userError) {
                    console.error(`Error fetching user ${userId}:`, userError);
                    leaderboardString += `${i + 1}. User ID ${userId} (Error fetching user) - Level ${level}, XP: ${xp}\n`;
                }
            }

            // 5. Create the Embed
            const embed = new EmbedBuilder()
                .setTitle('Server Leaderboard')
                .setDescription(leaderboardString || 'No users on the leaderboard.')
                .setColor('#0099ff')
                .setTimestamp();

            // 6. Reply to the Interaction
            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error("Error retrieving leaderboard:", error);
            await interaction.reply({ content: 'There was an error retrieving the leaderboard. Please try again later.', ephemeral: true });
        }
    },
    cooldown: 10, // 10 second cooldown for adding websites
};