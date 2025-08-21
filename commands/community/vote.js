// commands/community/vote.js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('vote')
        .setDescription('Creates a poll with 👍 and 👎 reactions.')
        .addStringOption(option =>
            option.setName('topic')
                .setDescription('The topic to vote on.')
                .setRequired(true)),
    async execute(interaction) {
        const topic = interaction.options.getString('topic');

        try {
            const message = await interaction.reply({ content: `Vote on: ${topic}`, fetchReply: true });
            await message.react('👍');
            await message.react('👎');
        } catch (error) {
            console.error("Error creating poll:", error);
            await interaction.reply({ content: 'There was an error creating the poll.', ephemeral: true });
        }
    },
        cooldown: 10, // 10 second cooldown for adding websites

};