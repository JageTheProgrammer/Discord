// commands/infra/logs.js
const { SlashCommandBuilder } = require('discord.js');
const { adminRole, adminUsers } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('logs')
        .setDescription('Displays recent logs from an application (admin only).')
        .addStringOption(option =>
            option.setName('app_name')
                .setDescription('The name of the application.')
                .setRequired(true)),
    async execute(interaction) {
        if (!interaction.member.roles.cache.has(adminRole) && !adminUsers.includes(interaction.user.id)) {
            return await interaction.reply({ content: 'You do not have permission to view logs.', ephemeral: true });
        }

        const appName = interaction.options.getString('app_name');

        // Replace with your actual log retrieval logic
        const logs = `[2023-10-27 10:00:00] INFO: Application started\n[2023-10-27 10:00:01] ERROR: Something went wrong`;

        try {
            await interaction.reply({ content: `\`\`\`\n${logs}\n\`\`\``, ephemeral: true });
        } catch (error) {
            console.error("Error retrieving logs:", error);
            await interaction.reply({ content: 'There was an error retrieving the logs.', ephemeral: true });
        }
    },
    cooldown: 10, // 10 second cooldown for adding websites
};