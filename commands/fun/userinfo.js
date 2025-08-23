// commands/utils/userinfo.js
import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Get information about a user')
    .addUserOption(opt =>
      opt.setName('user').setDescription('The user').setRequired(false)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    const member = await interaction.guild.members.fetch(user.id);

    await interaction.reply(
      `👤 **${user.tag}**\n🆔 ID: ${user.id}\n📅 Joined: ${member.joinedAt.toDateString()}\n🎂 Account Created: ${user.createdAt.toDateString()}`
    );
  },
};
