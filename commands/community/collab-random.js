import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('collab-random')
    .setDescription('Randomly pairs two users for a collaboration.'),
  async execute(interaction) {
    const guild = interaction.guild;

    try {
      await guild.members.fetch();
      const members = guild.members.cache.filter(member => !member.user.bot);
      const memberArray = Array.from(members.values());

      if (memberArray.length < 2) {
        return await interaction.reply({ content: 'Not enough members to pair for a collaboration.', ephemeral: true });
      }

      const user1 = memberArray[Math.floor(Math.random() * memberArray.length)];
      let user2 = memberArray[Math.floor(Math.random() * memberArray.length)];

      while (user1.id === user2.id) {
        user2 = memberArray[Math.floor(Math.random() * memberArray.length)];
      }

      await interaction.reply({ content: `Pairing ${user1.user.tag} and ${user2.user.tag} for a random collab!`, ephemeral: true });
    } catch (error) {
      console.error('Error pairing users for collaboration:', error);
      await interaction.reply({ content: 'There was an error pairing users for collaboration.', ephemeral: true });
    }
  },
  cooldown: 10,
};