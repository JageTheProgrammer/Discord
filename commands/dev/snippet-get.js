// commands/dev/snippet-get.js
const { SlashCommandBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('snippet-get')
        .setDescription('Retrieves a saved code snippet.')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('The name of the snippet.')
                .setRequired(true)),
    async execute(interaction) {
        const name = interaction.options.getString('name');
        const userId = interaction.user.id;

        const snippetsPath = path.join(__dirname, '../../database/snippets.json');
        let snippets = {};

        try {
            const data = fs.readFileSync(snippetsPath, 'utf8');
            snippets = JSON.parse(data);
        } catch (error) {
            console.error("Error reading snippets.json:", error);
            return await interaction.reply({ content: 'There was an error retrieving the snippet.', ephemeral: true });
        }

        if (!snippets[userId] || !snippets[userId][name]) {
            return await interaction.reply({ content: `Snippet \`${name}\` not found.`, ephemeral: true });
        }

        const code = snippets[userId][name];
        await interaction.reply({ content: `\`\`\`javascript\n${code}\n\`\`\``, ephemeral: true });
    },
    cooldown: 10, // 10 second cooldown for adding websites
};