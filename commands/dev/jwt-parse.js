import { SlashCommandBuilder } from 'discord.js';

function parseJwt(token) {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid JWT');
  const payload = Buffer.from(parts[1], 'base64url').toString('utf8');
  return JSON.stringify(JSON.parse(payload), null, 2);
}

export default {
  data: new SlashCommandBuilder()
    .setName('jwt-parse')
    .setDescription('Decode a JWT (header/payload only)')
    .addStringOption(o => o.setName('token').setDescription('JWT').setRequired(true)),
  async execute(interaction) {
    const token = interaction.options.getString('token');
    try {
      const json = parseJwt(token);
      await interaction.reply({ content: `\`\`\`json\n${json.substring(0, 1900)}\n\`\`\``, ephemeral: true });
    } catch {
      await interaction.reply({ content: 'Invalid JWT.', ephemeral: true });
    }
  },
};

