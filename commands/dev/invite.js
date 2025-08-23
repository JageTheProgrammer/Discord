import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('invite')
    .setDescription('Get the bot invite link for your server'),
  async execute(interaction) {
    const clientId = process.env.CLIENT_ID;
    if (!clientId) {
      return interaction.reply({ content: 'CLIENT_ID is not configured.', ephemeral: true });
    }
    const permissions = (PermissionFlagsBits.SendMessages | PermissionFlagsBits.EmbedLinks | PermissionFlagsBits.ManageMessages).toString();
    const url = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=${permissions}&scope=bot%20applications.commands`;
    await interaction.reply({ content: `🔗 Invite me: ${url}`, ephemeral: true });
  },
  cooldown: 5,
};