import { SlashCommandBuilder } from 'discord.js';
import axios from 'axios';

export default {
  data: new SlashCommandBuilder()
    .setName('whois')
    .setDescription('WHOIS lookup for a domain')
    .addStringOption(o => o.setName('domain').setDescription('Domain name').setRequired(true)),
  async execute(interaction) {
    const domain = interaction.options.getString('domain');
    await interaction.deferReply({ ephemeral: true });
    try {
      const { data } = await axios.get('https://api.whois.vu/?q=' + encodeURIComponent(domain));
      const out = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
      await interaction.editReply({ content: `\`\`\`\n${out.substring(0, 1900)}\n\`\`\`` });
    } catch {
      await interaction.editReply({ content: 'WHOIS lookup failed.' });
    }
  },
};

