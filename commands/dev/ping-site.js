import { SlashCommandBuilder } from 'discord.js';
import axios from 'axios';

export default {
  data: new SlashCommandBuilder()
    .setName('ping-site')
    .setDescription('Check if a site is up')
    .addStringOption(o => o.setName('url').setDescription('URL').setRequired(true)),
  async execute(interaction) {
    const url = interaction.options.getString('url');
    await interaction.deferReply({ ephemeral: true });
    try {
      const res = await axios.get(url, { timeout: 5000 });
      await interaction.editReply({ content: `✅ ${res.status} ${res.statusText}` });
    } catch (e) {
      await interaction.editReply({ content: `❌ ${e.response?.status || e.message}` });
    }
  },
};

