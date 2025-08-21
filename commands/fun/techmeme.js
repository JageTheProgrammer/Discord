import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getMeme } from '../../utils/memeApi.js';

export default {
  data: new SlashCommandBuilder()
    .setName('techmeme')
    .setDescription('Sends a random programmer meme.'),
  async execute(interaction) {
    try {
      const memeUrl = await getMeme();
      if (!memeUrl) {
        return await interaction.reply({ content: 'Could not fetch a meme at this time.', ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setImage(memeUrl)
        .setColor('#0099ff');

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error fetching meme:', error);
      await interaction.reply({ content: 'There was an error fetching a meme.', ephemeral: true });
    }
  },
  cooldown: 10,
};