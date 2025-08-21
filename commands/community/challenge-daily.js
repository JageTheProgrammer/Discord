import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('challenge-daily')
    .setDescription('Posts a daily coding challenge.'),
  async execute(interaction) {
    const challenge = {
      title: 'Reverse a String',
      description: 'Write a function that reverses a string.',
      link: 'https://www.example.com/coding-challenge',
    };

    const embed = new EmbedBuilder()
      .setTitle('Daily Coding Challenge')
      .setDescription(`**${challenge.title}**\n${challenge.description}\n[Link to Challenge](${challenge.link})`)
      .setColor('#0099ff');

    try {
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error posting daily challenge:', error);
      await interaction.reply({ content: 'There was an error posting the daily challenge.', ephemeral: true });
    }
  },
  cooldown: 10,
};