import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Shows a list of commands by category'),

  async execute(interaction) {
    const { client } = interaction;

    // Organize commands by folder/category
    const categories = {};
    for (const [name, cmd] of client.commands) {
      // Try to detect category by folder
      const category = cmd.category || "Other";
      if (!categories[category]) categories[category] = [];
      categories[category].push(cmd);
    }

    // Create a nice embed
    const embed = new EmbedBuilder()
      .setTitle('📜 Command List')
      .setDescription('Here are all available commands, grouped by category.')
      .setColor(0xFF6A00) // orange color
      .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();

    // Add fields for each category
    for (const category of Object.keys(categories)) {
      const cmds = categories[category]
        .map((c) => `\`/${c.data.name}\``) // show as slash command
        .join(', ');
      embed.addFields({ name: `✨ ${category}`, value: cmds || "No commands" });
    }

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
