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
    .setDescription('List all available commands'),
  
  async execute(interaction) {
    const commands = interaction.client.commands;

    // Group commands by category
    const grouped = {};
    commands.forEach(cmd => {
      const cat = cmd.category || 'Other';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(cmd.data.name);
    });

    const embed = new EmbedBuilder()
      .setTitle('🤖 Bot Commands')
      .setColor('#FF6A00')
      .setDescription('Here are all my commands, grouped by category:');

    // Add each category to the embed
    for (const [cat, cmdNames] of Object.entries(grouped)) {
      const emoji = categoryEmojis[cat] || '';
      embed.addFields({
        name: `${emoji} ${cat} (${cmdNames.length})`,
        value: cmdNames.map(n => `\`/${n}\``).join(', '),
      });
    }

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
