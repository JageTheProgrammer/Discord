import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('encode')
    .setDescription('Base64 encode/decode')
    .addStringOption(o => o.setName('mode').setDescription('encode or decode').addChoices({ name: 'encode', value: 'encode' }, { name: 'decode', value: 'decode' }).setRequired(true))
    .addStringOption(o => o.setName('text').setDescription('Text').setRequired(true)),
  async execute(interaction) {
    const mode = interaction.options.getString('mode');
    const text = interaction.options.getString('text');
    if (mode === 'encode') {
      return interaction.reply({ content: Buffer.from(text, 'utf8').toString('base64').slice(0, 1900), ephemeral: true });
    }
    try {
      const out = Buffer.from(text, 'base64').toString('utf8');
      return interaction.reply({ content: out.slice(0, 1900), ephemeral: true });
    } catch {
      return interaction.reply({ content: 'Invalid base64.', ephemeral: true });
    }
  },
};

