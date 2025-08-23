import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('uptime')
    .setDescription('Show bot uptime and resource usage'),
  async execute(interaction) {
    const uptimeSec = Math.floor(process.uptime());
    const days = Math.floor(uptimeSec / 86400);
    const hours = Math.floor((uptimeSec % 86400) / 3600);
    const minutes = Math.floor((uptimeSec % 3600) / 60);
    const seconds = uptimeSec % 60;

    const mem = process.memoryUsage();
    const formatMb = (n) => `${(n / 1024 / 1024).toFixed(1)} MB`;

    await interaction.reply({
      content: [
        `⏱️ Uptime: ${days}d ${hours}h ${minutes}m ${seconds}s`,
        `🧠 Memory RSS: ${formatMb(mem.rss)}, Heap Used: ${formatMb(mem.heapUsed)}`,
        `🌐 WS Ping: ${interaction.client.ws.ping}ms`,
        `🧩 Node: ${process.version}`,
      ].join('\n'),
      ephemeral: true,
    });
  },
  cooldown: 5,
};