// commands/infra/website.js
const { SlashCommandBuilder, InteractionResponseType, MessageFlags } = require('discord.js');
const { adminRole, adminUsers } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('website')
        .setDescription('Adds a website to the status monitor (admin only).')
        .addStringOption(option =>
            option.setName('url')
                .setDescription('The URL of the website.')
                .setRequired(true)),
    async execute(interaction) {
        if (!interaction.member.roles.cache.has(adminRole) && !adminUsers.includes(interaction.user.id)) {
            return interaction.reply({
                content: 'You do not have permission to add websites.',
                flags: MessageFlags.Ephemeral
            });
        }

        const websiteUrl = interaction.options.getString('url');

        try {
            console.log(`Adding website to monitor: ${websiteUrl}`);

            // Defer reply if processing might take time
            await interaction.deferReply({ ephemeral: true });

            // Simulate adding website logic
            // await addWebsiteToMonitor(websiteUrl);

            await interaction.editReply(`Added ${websiteUrl} to the status monitor.`);
        } catch (error) {
            console.error("Error adding website:", error);
            // If reply hasn't been sent yet
            if (!interaction.replied) {
                await interaction.reply({
                    content: 'There was an error adding the website.',
                    flags: MessageFlags.Ephemeral
                });
            } else {
                await interaction.editReply('There was an error adding the website.');
            }
        }
    },
    cooldown: 10, // 10 second cooldown for adding websites
};
