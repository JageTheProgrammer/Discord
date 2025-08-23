// commands/utils/roleinfo.js
import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('roleinfo')
    .setDescription('Get info about a role')
    .addRoleOption(opt =>
      opt.setName('role').setDescription('The role').setRequired(true)
    ),

  async execute(interaction) {
    const role = interaction.options.getRole('role');

    await interaction.reply(
      `🎭 **${role.name}**\n🆔 ID: ${role.id}\n👥 Members: ${role.members.size}\n🎨 Color: ${role.hexColor}`
    );
  },
};
