// commands/infra/website.js
import { SlashCommandBuilder } from 'discord.js';

const ADMIN_ROLE_ID = process.env.ADMIN_ROLE_ID;
const ADMIN_USER_IDS = (process.env.ADMIN_USER_IDS || '').split(',').map(s => s.trim()).filter(Boolean);

export default {
  data: new SlashCommandBuilder()
    .setName('website')
    .setDescription('Adds a website to the status monitor (admin only).')
    .addStringOption(option =>
      option.setName('url')
        .setDescription('The URL of the website.')
        .setRequired(true)),
  async execute(interaction) {
    const hasRole = ADMIN_ROLE_ID ? interaction.member.roles.cache.has(ADMIN_ROLE_ID) : false;
    const isAdminUser = ADMIN_USER_IDS.includes(interaction.user.id);
    if (!hasRole && !isAdminUser) {
      return interaction.reply({ content: 'You do not have permission to add websites.', ephemeral: true });
    }

    const websiteUrl = interaction.options.getString('url');

    try {
      await interaction.deferReply({ ephemeral: true });
      // Simulate adding website logic
      await interaction.editReply(`Added ${websiteUrl} to the status monitor.`);
    } catch (error) {
      console.error('Error adding website:', error);
      if (!interaction.replied) {
        await interaction.reply({ content: 'There was an error adding the website.', ephemeral: true });
      } else {
        await interaction.editReply('There was an error adding the website.');
      }
    }
  },
  cooldown: 10,
};
