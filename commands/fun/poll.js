// commands/utils/poll.js
import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Create a poll with 👍 and 👎 reactions')
    .addStringOption(opt =>
      opt.setName('question').setDescription('Poll question').setRequired(true)
    ),

  async execute(interaction) {
    const question = interaction.options.getString('question');
    const poll = await interaction.reply({ content: `📊 **Poll:** ${question}`, fetchReply: true });
    await poll.react('👍');
    await poll.react('👎');
  },
};
