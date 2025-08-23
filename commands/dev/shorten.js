import { SlashCommandBuilder } from 'discord.js';
import axios from 'axios';

export default {
  data: new SlashCommandBuilder()
    .setName('shorten')
    .setDescription('Shorten a URL via is.gd')
    .addStringOption(o => o.setName('url').setDescription('Long URL to shorten').setRequired(true)),
  async execute(interaction) {
    const url = interaction.options.getString('url', true);
    try {
      const resp = await axios.get('https://is.gd/create.php', { params: { format: 'simple', url } });
      const shortUrl = resp.data;
      await interaction.reply({ content: `🔗 ${shortUrl}`, ephemeral: true });
    } catch (e) {
      await interaction.reply({ content: 'Failed to shorten URL. Ensure it is valid.', ephemeral: true });
    }
  },
  cooldown: 5,
};