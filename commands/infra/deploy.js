import { SlashCommandBuilder } from 'discord.js';

const ADMIN_ROLE_ID = process.env.ADMIN_ROLE_ID;
const ADMIN_USER_IDS = (process.env.ADMIN_USER_IDS || '').split(',').map(s => s.trim()).filter(Boolean);

export default {
  data: new SlashCommandBuilder()
    .setName('deploy')
    .setDescription('Triggers a CI/CD pipeline (admin only).')
    .addStringOption(option =>
      option.setName('project')
        .setDescription('The name of the project to deploy.')
        .setRequired(true)),
  async execute(interaction) {
    const hasRole = ADMIN_ROLE_ID ? interaction.member.roles.cache.has(ADMIN_ROLE_ID) : false;
    const isAdminUser = ADMIN_USER_IDS.includes(interaction.user.id);
    if (!hasRole && !isAdminUser) {
      return await interaction.reply({ content: 'You do not have permission to deploy.', ephemeral: true });
    }

    const projectName = interaction.options.getString('project');
    console.log(`Deploying project: ${projectName}`);

    try {
      await interaction.reply({ content: `Deploying ${projectName}...`, ephemeral: true });
    } catch (error) {
      console.error('Error triggering deployment:', error);
      await interaction.reply({ content: 'There was an error triggering the deployment.', ephemeral: true });
    }
  },
  cooldown: 10,
};