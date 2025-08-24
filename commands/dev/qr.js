import { SlashCommandBuilder, AttachmentBuilder } from 'discord.js';
import QRCode from 'qrcode';

export default {
  data: new SlashCommandBuilder()
    .setName('qr')
    .setDescription('Generate a QR code for given text or URL')
    .addStringOption(o =>
      o.setName('text')
       .setDescription('Text or URL')
       .setRequired(true)
    ),
  async execute(interaction) {
    const text = interaction.options.getString('text', true);
    try {
      const buffer = await QRCode.toBuffer(text, { type: 'png', scale: 6, margin: 1 });
      const attachment = new AttachmentBuilder(buffer, { name: 'qr.png' });
      await interaction.reply({ content: 'Here is your QR code:', files: [attachment] });
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'Failed to generate QR code.', ephemeral: true });
    }
  },
  cooldown: 5, // optional cooldown in seconds
};
