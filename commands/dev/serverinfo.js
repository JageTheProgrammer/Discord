// serverinfo.js
import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Get info about this server'),
  async execute(interaction) {
    const { guild } = interaction;
    await interaction.reply(
      `📌 **Server:** ${guild.name}\n👥 Members: ${guild.memberCount}\n📅 Created: ${guild.createdAt.toDateString()}`
    );
  },
};
