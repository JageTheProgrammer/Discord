// commands/infra/status.js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('Shows the status of the website (replace with your actual status monitor logic).'),
    async execute(interaction) {
        // Replace with your actual website status monitor logic
        const websiteStatus = "Online"; // Or "Offline", "Degraded Performance", etc.

        try {
            await interaction.reply({ content: `Website Status: ${websiteStatus}`, ephemeral: true });
        } catch (error) {
            console.error("Error showing website status:", error);
            await interaction.reply({ content: 'There was an error showing the website status.', ephemeral: true });
        }
    },
    cooldown: 10, // 10 second cooldown for adding websites
};