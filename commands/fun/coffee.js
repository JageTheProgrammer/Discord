import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('coffee')
    .setDescription('Sends a "coffee break" invite.'),
  async execute(interaction) {
    try {
      const message = await interaction.reply({ content: `${interaction.user.tag} is inviting you for a coffee break! React with ☕ if you're in!`, fetchReply: true });
      await message.react('☕');
    } catch (error) {
      console.error('Error sending coffee invite:', error);
      await interaction.reply({ content: 'There was an error sending the coffee invite.', ephemeral: true });
    }
  },
  cooldown: 10,
};