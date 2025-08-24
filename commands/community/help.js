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

    // Build embeds per category, splitting if too long
    const pages = [];
    categories.forEach(([cat, cmds]) => {
      const emoji = categoryEmojis[cat] || '';
      let chunk = '';
      let pageCount = 0;

      cmds.forEach(c => {
        const line = `\`/${c.name}\` — ${c.description}\n`;
        if (chunk.length + line.length > 4000) {
          pages.push(
            new EmbedBuilder()
              .setTitle(`🤖 Bot Commands — ${emoji} ${cat}`)
              .setDescription(chunk)
              .setColor('#FF6A00')
              .setFooter({ text: `Page ${pages.length + 1}` })
          );
          chunk = '';
        }
        chunk += line;
      });

      if (chunk.length) {
        pages.push(
          new EmbedBuilder()
            .setTitle(`🤖 Bot Commands — ${emoji} ${cat}`)
            .setDescription(chunk)
            .setColor('#FF6A00')
            .setFooter({ text: `Page ${pages.length + 1}` })
        );
      }
    });

    let page = 0;

    const row = new ActionRowBuilder().addComponents([
      new ButtonBuilder().setCustomId('prev').setLabel('⬅️ Prev').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('next').setLabel('Next ➡️').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('stop').setLabel('🛑 Close').setStyle(ButtonStyle.Danger),
    ]);

    await interaction.reply({
      embeds: [pages[page]],
      components: [row],
      ephemeral: true,
    });

    const msg = await interaction.fetchReply();
    const collector = msg.createMessageComponentCollector({ time: 60_000 });

    collector.on('collect', async i => {
      if (i.user.id !== interaction.user.id)
        return i.reply({ content: "⚠️ This menu isn't for you!", ephemeral: true });

      if (i.customId === 'prev') page = (page - 1 + pages.length) % pages.length;
      else if (i.customId === 'next') page = (page + 1) % pages.length;
      else if (i.customId === 'stop') {
        collector.stop();
        return i.update({ content: '❌ Help menu closed.', embeds: [], components: [] });
      }

      await i.update({ embeds: [pages[page]], components: [row] });
    });

    collector.on('end', async () => {
      if (!interaction.ephemeral && msg.editable) {
        await msg.edit({ components: [] }).catch(() => {});
      }
    });
  },
};