// commands/moderation/clear.js
import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Delete messages in a channel')
    .addIntegerOption(opt =>
      opt.setName('amount').setDescription('Number of messages to delete (max 100)').setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');
    if (amount < 1 || amount > 100)
      return interaction.reply({ content: '❌ Enter a number between 1-100.', ephemeral: true });

    await interaction.channel.bulkDelete(amount, true);
    await interaction.reply(`🧹 Cleared **${amount}** messages`);
  },
};
