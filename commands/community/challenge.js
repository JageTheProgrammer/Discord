import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('challenge')
    .setDescription('Get today’s coding challenge.'),
  async execute(interaction) {
    await interaction.reply('💡 Today’s challenge: Build a Fibonacci function!');
  },
  cooldown: 10,
};
