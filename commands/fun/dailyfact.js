import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('dailyfact')
    .setDescription('Posts a random tech fact or CS history tidbit.'),
  async execute(interaction) {
    const facts = [
      'The first computer programmer was Ada Lovelace.',
      'The Internet was originally called ARPANET.',
      'The first computer mouse was made of wood.',
    ];
    const fact = facts[Math.floor(Math.random() * facts.length)];

    try {
      await interaction.reply({ content: `Daily Tech Fact: ${fact}`, ephemeral: true });
    } catch (error) {
      console.error('Error posting daily fact:', error);
      await interaction.reply({ content: 'There was an error posting the daily fact.', ephemeral: true });
    }
  },
  cooldown: 10,
};