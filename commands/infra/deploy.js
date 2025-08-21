// commands/infra/deploy.js
const { SlashCommandBuilder } = require('discord.js');
const { adminRole, adminUsers } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deploy')
        .setDescription('Triggers a CI/CD pipeline (admin only).')
        .addStringOption(option =>
            option.setName('project')
                .setDescription('The name of the project to deploy.')
                .setRequired(true)),
    async execute(interaction) {
        if (!interaction.member.roles.cache.has(adminRole) && !adminUsers.includes(interaction.user.id)) {
            return await interaction.reply({ content: 'You do not have permission to deploy.', ephemeral: true });
        }

        const projectName = interaction.options.getString('project');

        // Replace with your actual CI/CD trigger logic (e.g., GitHub Actions API)
        console.log(`Deploying project: ${projectName}`);

        try {
            await interaction.reply({ content: `Deploying ${projectName}...`, ephemeral: true });
        } catch (error) {
            console.error("Error triggering deployment:", error);
            await interaction.reply({ content: 'There was an error triggering the deployment.', ephemeral: true });
        }
    },
    cooldown: 10, // 10 second cooldown for adding websites
};