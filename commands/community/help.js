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
    await interaction.deferReply({ ephemeral: true });

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
      return interaction.editReply({ content: '❌ No commands found.', ephemeral: true });
    }

    // Build embeds (1 per category, multiple pages if needed)
    const pages = [];
    categories.forEach(([cat, cmds]) => {
      const emoji = categoryEmojis[cat] || '';
      const cmdLines = cmds.map(c => `\`/${c.name}\` — ${c.description}`);

      let description = '';
      const maxLength = 4000; // Leave room for title & footer
      for (const line of cmdLines) {
        if (description.length + line.length + 1 > maxLength) {
          pages.push(new EmbedBuilder()
            .setTitle(`🤖 Bot Commands — ${emoji} ${cat}`)
            .setColor('#FF6A00')
            .setDescription(description.trim())
            .setFooter({ text: `Category: ${cat}` })
          );
          description = line + '\n';
        } else {
          description += line + '\n';
        }
      }

      if (description) {
        pages.push(new EmbedBuilder()
          .setTitle(`🤖 Bot Commands — ${emoji} ${cat}`)
          .setColor('#FF6A00')
          .setDescription(description.trim())
          .setFooter({ text: `Category: ${cat}` })
        );
      }
    });

    let page = 0;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('prev').setLabel('⬅️ Prev').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('next').setLabel('Next ➡️').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('stop').setLabel('🛑 Close').setStyle(ButtonStyle.Danger),
    );

    const msg = await interaction.editReply({
      embeds: [pages[page]],
      components: [row],
    });

    const collector = msg.createMessageComponentCollector({
      time: 120_000,
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
