// commands/moderation/unmute.js
import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Unmute a member (remove timeout)')
    .addUserOption(opt =>
      opt.setName('user').setDescription('User to unmute').setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    if (!member) return interaction.reply({ content: '❌ User not found!', ephemeral: true });

    await member.timeout(null);
    await interaction.reply(`🔊 Unmuted **${user.tag}**`);
  },
};
