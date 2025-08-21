// commands/dev/error.js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('error')
        .setDescription('Searches Stack Overflow for solutions to an error message.')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The error message to search for.')
                .setRequired(true)),
    async execute(interaction) {
        const errorMessage = interaction.options.getString('message');
        const searchQuery = encodeURIComponent(errorMessage + " site:stackoverflow.com");
        const searchUrl = `https://www.google.com/search?q=${searchQuery}`;

        try {
            await interaction.reply({ content: `Here are some Stack Overflow results for your error:\n${searchUrl}`, ephemeral: true });
        } catch (error) {
            console.error("Error searching Stack Overflow:", error);
            await interaction.reply({ content: 'Sorry, I couldn\'t find any relevant Stack Overflow results.', ephemeral: true });
        }
    },
        cooldown: 10, // 10 second cooldown for adding websites

};