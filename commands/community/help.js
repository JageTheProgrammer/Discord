import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

const categoryEmojis = {
  Fun: '🎉',
  Moderation: '🔨',
  Community: '🌐',
  Dev: '💻',
  Infra: '🛠️',
  Other: '📦',
};

export default {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('List all available commands with descriptions'),

  async execute(interaction) {
    const commands = interaction.client.commands;

    // Group commands by category
    const grouped = {};
    commands.forEach(cmd => {
      const cat = cmd.category || 'Other';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push({ name: cmd.data.name, description: cmd.data.description || 'No description' });
    });

    const embed = new EmbedBuilder()
      .setTitle('🤖 Bot Commands')
      .setColor('#FF6A00')
      .setDescription('Here are all my commands, grouped by category:');

    // Add each category with command descriptions
    for (const [cat, cmds] of Object.entries(grouped)) {
      const emoji = categoryEmojis[cat] || '';
      const value = cmds.map(c => `\`/${c.name}\` — ${c.description}`).join('\n');
      embed.addFields({ name: `${emoji} ${cat} (${cmds.length})`, value });
    }

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
