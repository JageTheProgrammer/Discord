// commands/fun/rank.js
const { SlashCommandBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Shows your rank and XP.'),
    async execute(interaction) {
        const userId = interaction.user.id;
        const ranksPath = path.join(__dirname, '../../database/ranks.json');
        let ranks = {};

        try {
            const data = fs.readFileSync(ranksPath, 'utf8');
            ranks = JSON.parse(data);
        } catch (error) {
            console.error("Error reading ranks.json:", error);
        }

        if (!ranks[userId]) {
            ranks[userId] = { xp: 0, level: 1 };
        }

        const xp = ranks[userId].xp;
        const level = ranks[userId].level;

        try {
            await interaction.reply({ content: `Your rank: Level ${level}, XP: ${xp}`, ephemeral: true });
        } catch (error) {
            console.error("Error showing rank:", error);
            await interaction.reply({ content: 'There was an error showing your rank.', ephemeral: true });
        }
    },
    cooldown: 10, // 10 second cooldown for adding websites
};