import { SlashCommandBuilder } from 'discord.js';
import { createEmbed, UI_COLORS } from '../../utils/ui.js';

const ADMIN_ROLE_ID = process.env.ADMIN_ROLE_ID;
const ADMIN_USER_IDS = (process.env.ADMIN_USER_IDS || '').split(',').map(s => s.trim()).filter(Boolean);

export default {
  data: new SlashCommandBuilder()
    .setName('logs')
    .setDescription('Displays recent logs from an application (admin only).')
    .addStringOption(option =>
      option.setName('app_name')
        .setDescription('The name of the application.')
        .setRequired(true)),
  async execute(interaction) {
    const hasRole = ADMIN_ROLE_ID ? interaction.member.roles.cache.has(ADMIN_ROLE_ID) : false;
    const isAdminUser = ADMIN_USER_IDS.includes(interaction.user.id);
    if (!hasRole && !isAdminUser) {
      return await interaction.reply({ content: 'You do not have permission to view logs.', ephemeral: true });
    }

    const appName = interaction.options.getString('app_name');

    const logs = `[2023-10-27 10:00:00] INFO: ${appName} started\n[2023-10-27 10:00:01] ERROR: Example error`;

    try {
      const embed = createEmbed({ title: `📜 Logs: ${appName}`, description: `\`\`\`\n${logs}\n\`\`\``, color: UI_COLORS.info });
      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.error('Error retrieving logs:', error);
      await interaction.reply({ content: 'There was an error retrieving the logs.', ephemeral: true });
    }
  },
  cooldown: 10,
};