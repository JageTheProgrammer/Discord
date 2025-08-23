import { SlashCommandBuilder } from 'discord.js';
import axios from 'axios';

export default {
  data: new SlashCommandBuilder()
    .setName('ip')
    .setDescription('IP geolocation & info')
    .addStringOption(o => o.setName('address').setDescription('IP address or domain').setRequired(true)),
  async execute(interaction) {
    const address = interaction.options.getString('address');
    await interaction.deferReply({ ephemeral: true });
    try {
      const { data } = await axios.get(`https://ipapi.co/${encodeURIComponent(address)}/json/`);
      await interaction.editReply({ content: `\`\`\`json\n${JSON.stringify(data, null, 2).substring(0, 1900)}\n\`\`\`` });
    } catch {
      await interaction.editReply({ content: 'IP lookup failed.' });
    }
  },
};

