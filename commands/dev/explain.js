import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('explain')
    .setDescription('Explains a code snippet using AI (replace with your AI integration).')
    .addStringOption(option =>
      option.setName('code')
        .setDescription('The code snippet to explain.')
        .setRequired(true)),
  async execute(interaction) {
    const code = interaction.options.getString('code');

    const explanation = `This is a placeholder explanation for the code:\n\`\`\`javascript\n${code}\n\`\`\``;

    try {
      await interaction.reply({ content: explanation, ephemeral: true });
    } catch (error) {
      console.error('Error explaining code:', error);
      await interaction.reply({ content: "Sorry, I couldn't explain that code.", ephemeral: true });
    }
  },
  cooldown: 10,
};