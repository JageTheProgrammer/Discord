import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';

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

      const data = cmd.data.toJSON?.() ?? cmd.data;
      grouped[cat].push({
        name: data.name,
        description: data.description || 'No description',
      });
    });

    const categories = Object.entries(grouped);
    if (!categories.length) {
      return interaction.reply({ content: '❌ No commands found.', ephemeral: true });
    }

    // Build embeds (1 per category)
    const pages = categories.map(([cat, cmds], idx) => {
      const emoji = categoryEmojis[cat] || '';
      return new EmbedBuilder()
        .setTitle(`🤖 Bot Commands — ${emoji} ${cat}`)
        .setColor('#FF6A00')
        .setDescription(
          cmds.map(c => `\`/${c.name}\` — ${c.description}`).join('\n')
        )
        .setFooter({ text: `Page ${idx + 1} of ${categories.length}` });
    });

    let page = 0;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('prev').setLabel('⬅️ Prev').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('next').setLabel('Next ➡️').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('stop').setLabel('🛑 Close').setStyle(ButtonStyle.Danger),
    );

    // Initial reply
    await interaction.reply({
      embeds: [pages[page]],
      components: [row],
      ephemeral: true,
    });

    const msg = await interaction.fetchReply();
    const collector = msg.createMessageComponentCollector({
      time: 60_000, // 1 min
    });

    collector.on('collect', async i => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({ content: "⚠️ This menu isn't for you!", ephemeral: true });
      }

      if (i.customId === 'prev') {
        page = (page - 1 + pages.length) % pages.length;
      } else if (i.customId === 'next') {
        page = (page + 1) % pages.length;
      } else if (i.customId === 'stop') {
        collector.stop();
        return i.update({ content: '❌ Help menu closed.', embeds: [], components: [] });
      }

      await i.update({ embeds: [pages[page]], components: [row] });
    });

    collector.on('end', async () => {
      if (msg.editable) {
        await msg.edit({ components: [] }).catch(() => {});
      }
    });
  },
};