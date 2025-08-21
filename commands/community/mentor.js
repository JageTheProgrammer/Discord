// commands/community/mentor.js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mentor')
        .setDescription('Finds mentors or learners for a specific topic.')
        .addStringOption(option =>
            option.setName('topic')
                .setDescription('The topic to find mentors/learners for.')
                .setRequired(true)),
    async execute(interaction) {
        const topic = interaction.options.getString('topic');

        // Replace with your actual mentor/learner matching logic
        const mentors = ['@user1', '@user2'];
        const learners = ['@user3', '@user4'];

        try {
            await interaction.reply({ content: `Looking for a ${topic} mentor...\n${topic} mentors: ${mentors.join(', ')}\n${topic} learners: ${learners.join(', ')}`, ephemeral: true });
        } catch (error) {
            console.error("Error finding mentors:", error);
            await interaction.reply({ content: 'There was an error finding mentors/learners.', ephemeral: true });
        }
    },
        cooldown: 10, // 10 second cooldown for adding websites

};