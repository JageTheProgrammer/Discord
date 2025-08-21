import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('meme')
    .setDescription('Get a random programming meme.'),
  async execute(interaction) {
    await interaction.reply('😂 Here’s your random meme (placeholder).');
  },
  cooldown: 10,
};
