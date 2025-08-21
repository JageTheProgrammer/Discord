// commands/dev/docs.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetchDocs = require('../../utils/fetchDocs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('docs')
        .setDescription('Fetches documentation for a library or module.')
        .addStringOption(option =>
            option.setName('lib')
                .setDescription('The library or module to search for.')
                .setRequired(true)),
    async execute(interaction) {
        const lib = interaction.options.getString('lib');
        try {
            const docContent = await fetchDocs(lib); // Use your fetchDocs function
            if (!docContent) {
                return await interaction.reply({ content: `Couldn't find documentation for \`${lib}\`.`, ephemeral: true });
            }
            const embed = new EmbedBuilder()
                .setTitle(`Documentation for ${lib}`)
                .setDescription(docContent)
                .setColor('#0099ff');
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: `Couldn't find documentation for \`${lib}\`.`, ephemeral: true });
        }
    },
        cooldown: 10, // 10 second cooldown for adding websites

};