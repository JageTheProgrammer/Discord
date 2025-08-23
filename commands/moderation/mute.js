// commands/moderation/mute.js
import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Mute a member (timeout)')
    .addUserOption(opt =>
      opt.setName('user').setDescription('User to mute').setRequired(true)
    )
    .addIntegerOption(opt =>
      opt.setName('minutes').setDescription('Minutes to mute').setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const minutes = interaction.options.getInteger('minutes');
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    if (!member) return interaction.reply({ content: '❌ User not found!', ephemeral: true });

    const ms = minutes * 60 * 1000;
    await member.timeout(ms, `Muted by ${interaction.user.tag}`);
    await interaction.reply(`🔇 Muted **${user.tag}** for ${minutes} minutes`);
  },
};
