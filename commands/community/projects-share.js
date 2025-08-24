import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('projects-share')
    .setDescription('Shares a project in the project showcase channel.')
    .addStringOption(option =>
      option.setName('title')
        .setDescription('The title of the project.')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('tech_stack')
        .setDescription('The tech stack used in the project.')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('github_link')
        .setDescription('The GitHub link to the project.')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('description')
        .setDescription('A brief description of the project.')
        .setRequired(true)),
  async execute(interaction) {
    const title = interaction.options.getString('title');
    const techStack = interaction.options.getString('tech_stack');
    const githubLink = interaction.options.getString('github_link');
    const description = interaction.options.getString('description');

    const projectShowcaseChannelId = '1408469162803724288';
    const projectShowcaseChannel = interaction.client.channels.cache.get(projectShowcaseChannelId);

    if (!projectShowcaseChannel) {
      return await interaction.reply({ content: 'Project showcase channel not found.', ephemeral: true });
    }

    try {
      await projectShowcaseChannel.send(`**${title}**\nTech Stack: ${techStack}\nGitHub: ${githubLink}\nDescription: ${description}\nShared by: ${interaction.user.tag}`);
      await interaction.reply({ content: `Project \`${title}\` shared in <#${projectShowcaseChannelId}>!`, ephemeral: true });
    } catch (error) {
      console.error('Error sharing project:', error);
      await interaction.reply({ content: 'There was an error sharing the project.', ephemeral: true });
    }
  },
  cooldown: 10,
};
