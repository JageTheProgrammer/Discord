import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import fetchGithub from '../../utils/fetchGithub.js';

export default {
  data: new SlashCommandBuilder()
    .setName('github')
    .setDescription('Gets information about a GitHub user.')
    .addStringOption(option =>
      option.setName('user')
        .setDescription('The GitHub username.')
        .setRequired(true)),
  async execute(interaction) {
    const username = interaction.options.getString('user');

    await interaction.deferReply({ ephemeral: true });

    try {
      const userInfo = await fetchGithub(username);
      if (!userInfo) {
        return await interaction.editReply({ content: `User \`${username}\` not found on GitHub.` });
      }

      const embed = new EmbedBuilder()
        .setTitle(`GitHub Profile: ${userInfo.login}`)
        .setURL(userInfo.html_url)
        .setDescription(userInfo.bio || 'No bio available.')
        .setThumbnail(userInfo.avatar_url)
        .addFields(
          { name: 'Followers', value: `${userInfo.followers}`, inline: true },
          { name: 'Following', value: `${userInfo.following}`, inline: true },
          { name: 'Public Repos', value: `${userInfo.public_repos}`, inline: true }
        )
        .setColor('#0099ff');

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      if (interaction.deferred || interaction.replied) {
        await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
      } else {
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
      }
    }
  },
  cooldown: 10,
};