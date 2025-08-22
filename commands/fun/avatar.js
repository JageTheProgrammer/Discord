// avatar.js
import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Get a user’s avatar')
    .addUserOption(opt =>
      opt.setName('user').setDescription('The user').setRequired(false)
    ),
  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    await interaction.reply(user.displayAvatarURL({ dynamic: true, size: 1024 }));
  },
};
