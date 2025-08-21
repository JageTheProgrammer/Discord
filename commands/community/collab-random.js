// commands/community/collab-random.js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('collab-random')
        .setDescription('Randomly pairs two users for a collaboration.'),
    async execute(interaction) {
        const guild = interaction.guild;

        try {
            await guild.members.fetch(); // Ensure all members are cached
            const members = guild.members.cache.filter(member => !member.user.bot); // Exclude bots
            const memberArray = Array.from(members.values());

            if (memberArray.length < 2) {
                return await interaction.reply({ content: 'Not enough members to pair for a collaboration.', ephemeral: true });
            }

            const user1 = memberArray[Math.floor(Math.random() * memberArray.length)];
            let user2 = memberArray[Math.floor(Math.random() * memberArray.length)];

            // Ensure user1 and user2 are different
            while (user1.id === user2.id) {
                user2 = memberArray[Math.floor(Math.random() * memberArray.length)];
            }

            await interaction.reply({ content: `Pairing ${user1.user.tag} and ${user2.user.tag} for a random collab!`, ephemeral: true });
        } catch (error) {
            console.error("Error pairing users for collaboration:", error);
            await interaction.reply({ content: 'There was an error pairing users for collaboration.', ephemeral: true });
        }
    },
        cooldown: 10, // 10 second cooldown for adding websites

};