// commands/fun/quote-random.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quote')
        .setDescription('Sends a random inspirational quote.'),
    async execute(interaction) {
        const quotesPath = path.join(__dirname, '../../database/quotes.json');
        let quotes = [];

        try {
            const data = fs.readFileSync(quotesPath, 'utf8');
            quotes = JSON.parse(data);
        } catch (error) {
            console.error("Error reading quotes.json:", error);
            return await interaction.reply({ content: 'There was an error retrieving a quote.', ephemeral: true });
        }

        if (quotes.length === 0) {
            return await interaction.reply({ content: 'No quotes available.', ephemeral: true });
        }

        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

        const embed = new EmbedBuilder()
            .setTitle('Inspirational Quote')
            .setDescription(`"${randomQuote.quote}" - ${randomQuote.author}`)
            .setColor('#0099ff');

        try {
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error("Error sending quote:", error);
            await interaction.reply({ content: 'There was an error sending the quote.', ephemeral: true });
        }
    },
    cooldown: 10, // 10 second cooldown for adding websites
};