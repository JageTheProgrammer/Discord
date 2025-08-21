import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('debugme')
    .setDescription('Roasts your last code message.'),
  async execute(interaction) {
    const roasts = [
      'Did you try turning it off and on again?',
      'You just invented spaghetti 2.0 🍝',
      'I bet you forgot a semicolon.',
    ];
    const roast = roasts[Math.floor(Math.random() * roasts.length)];

    try {
      await interaction.reply({ content: roast, ephemeral: true });
    } catch (error) {
      console.error('Error roasting user:', error);
      await interaction.reply({ content: 'There was an error roasting you.', ephemeral: true });
    }
  },
  cooldown: 10,
};