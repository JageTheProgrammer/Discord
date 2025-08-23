import { SlashCommandBuilder } from 'discord.js';
import dns from 'node:dns/promises';

export default {
  data: new SlashCommandBuilder()
    .setName('dns')
    .setDescription('DNS records lookup')
    .addStringOption(o => o.setName('domain').setDescription('Domain name').setRequired(true))
    .addStringOption(o => o.setName('type').setDescription('Record type (A, AAAA, CNAME, TXT, MX)').setRequired(false)),
  async execute(interaction) {
    const domain = interaction.options.getString('domain');
    const type = (interaction.options.getString('type') || 'A').toUpperCase();
    await interaction.deferReply({ ephemeral: true });
    try {
      let res;
      switch (type) {
        case 'AAAA': res = await dns.resolve6(domain); break;
        case 'CNAME': res = await dns.resolveCname(domain); break;
        case 'TXT': res = await dns.resolveTxt(domain); break;
        case 'MX': res = await dns.resolveMx(domain); break;
        case 'NS': res = await dns.resolveNs(domain); break;
        default: res = await dns.resolve4(domain); break;
      }
      const out = Array.isArray(res) ? JSON.stringify(res, null, 2) : String(res);
      await interaction.editReply({ content: `\`\`\`json\n${out.substring(0, 1900)}\n\`\`\`` });
    } catch {
      await interaction.editReply({ content: 'DNS lookup failed.' });
    }
  },
};

