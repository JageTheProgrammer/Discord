import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription('Shows the status of the website (replace with your actual status monitor logic).'),
  async execute(interaction) {
    const websiteStatus = 'Online';

    try {
      await interaction.reply({ content: `Website Status: ${websiteStatus}`, ephemeral: true });
    } catch (error) {
      console.error('Error showing website status:', error);
      await interaction.reply({ content: 'There was an error showing the website status.', ephemeral: true });
    }
  },
  cooldown: 10,
};