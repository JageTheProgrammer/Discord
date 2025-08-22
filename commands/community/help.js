import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

const categoryEmojis = {
  Fun: '🎉',
  Moderation: '🔨',
  Community: '🌐',
  Dev: '💻',
  Infra: '🛠️',
  Other: '📦',
};

const categoryColors = {
  Fun: 0xFF6A00,        // Orange
  Moderation: 0xFF0000, // Red
  Community: 0x00FF00,  // Green
  Dev: 0x0000FF,        // Blue
  Infra: 0x8A2BE2,      // Purple
  Other: 0xFFFFFF,      // White
};

export default {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('📚 Show all available commands'),

  async execute(interaction) {
    const commands = interaction.client.commands;

    // Group commands by category
    const categories = {};
    for (const [, cmd] of commands) {
      const category = cmd.category || 'Other';
      if (!categories[category]) categories[category] = [];
      categories[category].push(cmd);
    }

    // Build embed fields
    const fields = Object.entries(categories).map(([cat, cmds]) => ({
      name: `${categoryEmojis[cat] || ''} ${cat} (${cmds.length})`,
      value: cmds.map(c => `\`/${c.data.name}\` — ${c.data.description}`).join('\n'),
      inline: false,
    }));

    // Send embed for each category with its color
    const embed = new EmbedBuilder()
      .setTitle('🤖 Command List')
      .setDescription('Here are all available commands, organized by category:')
      .addFields(fields)
      .setColor(0xFF6A00) // default color
      .setFooter({ text: `Total commands: ${commands.size}` });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
