// utils/statusUpdater.js
import { EmbedBuilder } from 'discord.js';
import axios from 'axios';
import cron from 'node-cron';

const channelIds = {
  ping: process.env.YOUR_PING_CHANNEL_ID,
  website1: process.env.YOUR_WEBSITE_1_CHANNEL_ID,
  website2: process.env.YOUR_WEBSITE_2_CHANNEL_ID,
  memberCounter: process.env.YOUR_MEMBER_COUNTER_CHANNEL_ID,
  welcomeChannel: process.env.YOUR_WELCOME_CHANNEL_ID
};

const websiteUrls = {
  website1: process.env.YOUR_WEBSITE_1_URL,
  website2: process.env.YOUR_WEBSITE_2_URL
};

// --- UI palette ---
const COLORS = {
  online: '#00FF00',     // Green
  offline: '#FF0000',    // Red
  maintenance: '#FFA500',// Orange
  info: '#00BFFF',       // Deep sky blue
  main: '#2C2F33'        // Dark theme color for embeds
};

const ICONS = {
  online: '🟢',
  offline: '🔴',
  maintenance: '🟠',
  bot: '🤖'
};

// --- Functions ---

async function getPingStatus(client) {
  const pingChannel = client.channels.cache.get(channelIds.ping);
  if (!pingChannel) {
    return console.error('Ping channel not found. Please check your channel ID configuration.');
  }

  const ping = client.ws.ping;
  const embed = new EmbedBuilder()
    .setColor(COLORS.info)
    .setTitle(`${ICONS.bot} Bot Ping Status`)
    .setDescription(`**Latency:** \`${ping}ms\``)
    .setFooter({ text: 'Updated every 5 minutes' });

  try {
    const messages = await pingChannel.messages.fetch({ limit: 1 });
    const lastMessage = messages.first();
    if (lastMessage) {
      await lastMessage.edit({ embeds: [embed] });
    } else {
      await pingChannel.send({ embeds: [embed] });
    }
  } catch (err) {
    console.error(`Failed to update ping status message in channel ${pingChannel.id}:`, err);
  }
}

async function getWebsiteStatus(client, websiteKey) {
  const channel = client.channels.cache.get(channelIds[websiteKey]);
  if (!channel) {
    return console.error(`Website status channel for ${websiteKey} not found. Please check your channel ID configuration.`);
  }

  const websiteUrl = websiteUrls[websiteKey];
  let status = `Offline ${ICONS.offline}`;
  let statusColor = COLORS.offline;
  let statusDetails = 'Failed to connect.';

  try {
    const response = await axios.get(websiteUrl);
    if (response.status === 200) {
      status = `Online ${ICONS.online}`;
      statusColor = COLORS.online;
      statusDetails = 'Server is running smoothly.';
    } else {
      status = `Maintenance ${ICONS.maintenance}`;
      statusColor = COLORS.maintenance;
      statusDetails = `Server responded with status code \`${response.status}\`.`;
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      statusDetails = 'Connection refused. The server might be down or unreachable.';
    } else if (error.code === 'ENOTFOUND') {
      statusDetails = 'DNS lookup failed. The URL might be incorrect or the server hostname does not exist.';
    } else {
      statusDetails = `An unknown error occurred: \`${error.message}\`.`;
    }
  }

  const embed = new EmbedBuilder()
    .setColor(statusColor)
    .setTitle(`🌐 ${websiteKey.charAt(0).toUpperCase() + websiteKey.slice(1)} Status`)
    .setURL(websiteUrl)
    .addFields(
      { name: 'Status', value: status, inline: true },
      { name: 'URL', value: `[Visit Website](${websiteUrl})`, inline: true },
      { name: 'Details', value: statusDetails, inline: false }
    )
    .setFooter({ text: 'Updated every 5 minutes' });

  try {
    const messages = await channel.messages.fetch({ limit: 1 });
    const lastMessage = messages.first();
    if (lastMessage) {
      await lastMessage.edit({ embeds: [embed] });
    } else {
      await channel.send({ embeds: [embed] });
    }
  } catch (err) {
    console.error(`Failed to update website status message in channel ${channel.id}:`, err);
  }
}

async function updateMemberCounter(client) {
  const guild = client.guilds.cache.get(process.env.GUILD_ID);
  if (!guild) {
    return console.error('Guild not found. Please check your GUILD_ID configuration.');
  }

  const counterChannel = guild.channels.cache.get(channelIds.memberCounter);
  if (!counterChannel) {
    return console.error('Member counter channel not found. Please check your channel ID configuration.');
  }

  const memberCount = guild.memberCount;
  try {
    await counterChannel.setName(`👥 Members: ${memberCount}`);
  } catch (err) {
    console.error(`Failed to update member counter channel name in guild ${guild.id}:`, err);
  }
}

export function startStatusUpdater(client) {
  // Update every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    console.log('Running scheduled status updates...');
    await getPingStatus(client);
    await getWebsiteStatus(client, 'website1');
    await getWebsiteStatus(client, 'website2');
  });

  // Update member counter every minute
  cron.schedule('* * * * *', async () => {
    await updateMemberCounter(client);
  });
}

export async function handleWelcome(member) {
  const welcomeChannel = member.guild.channels.cache.get(channelIds.welcomeChannel);
  if (!welcomeChannel) {
    return console.error('Welcome channel not found. Please check your channel ID configuration.');
  }

  const welcomeEmbed = new EmbedBuilder()
    .setColor(COLORS.online)
    .setTitle(`🎉 Welcome to the server, ${member.user.username}!`)
    .setDescription(`We're glad to have you! You are our **${member.guild.memberCount}** member.`)
    .setThumbnail(member.user.displayAvatarURL())
    .setFooter({ text: `User ID: ${member.id}` })
    .setTimestamp();

  try {
    await welcomeChannel.send({ embeds: [welcomeEmbed] });
  } catch (err) {
    console.error(`Failed to send welcome message to channel ${welcomeChannel.id}:`, err);
  }
}
