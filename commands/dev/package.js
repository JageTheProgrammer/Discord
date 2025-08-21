import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import fetchPackage from '../../utils/fetchPackage.js';

export default {
  data: new SlashCommandBuilder()
    .setName('package')
    .setDescription('Gets information about a package from npm, PyPI, etc.')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('The name of the package.')
        .setRequired(true)),
  async execute(interaction) {
    const packageName = interaction.options.getString('name');

    try {
      const packageInfo = await fetchPackage(packageName);
      if (!packageInfo) {
        return await interaction.reply({ content: `Package \`${packageName}\` not found.`, ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setTitle(`Package: ${packageInfo.name}`)
        .setDescription(packageInfo.description || 'No description available.')
        .addFields(
          { name: 'Version', value: packageInfo.version || 'N/A', inline: true },
          { name: 'Downloads', value: packageInfo.downloads || 'N/A', inline: true },
          { name: 'Link', value: packageInfo.link || 'N/A', inline: true }
        )
        .setColor('#0099ff');

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error fetching package info:', error);
      await interaction.reply({ content: `Sorry, I couldn't find information about package \`${packageName}\`.`, ephemeral: true });
    }
  },
  cooldown: 10,
};