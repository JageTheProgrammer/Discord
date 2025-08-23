// commands/utils/botinfo.js
import { SlashCommandBuilder } from 'discord.js';
import pkg from '../../package.json' with { type: 'json' };

export default {
  data: new SlashCommandBuilder()
    .setName('botinfo')
    .setDescription('Get info about the bot'),

  async execute(interaction) {
    const { client } = interaction;
    await interaction.reply(
      `🤖 **${client.user.tag}**\n📅 Created: ${client.user.createdAt.toDateString()}\n📝 Version: ${pkg.version}`
    );
  },
};
