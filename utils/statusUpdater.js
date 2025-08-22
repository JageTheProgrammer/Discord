// utils/statusUpdater.js
import { EmbedBuilder } from 'discord.js';
import axios from 'axios';
import cron from 'node-cron';

const channelIds = {
  ping: 'YOUR_PING_CHANNEL_ID',
  website1: 'YOUR_WEBSITE_1_CHANNEL_ID',
  website2: 'YOUR_WEBSITE_2_CHANNEL_ID',
  memberCounter: 'YOUR_MEMBER_COUNTER_CHANNEL_ID',
  welcomeChannel: 'YOUR_WELCOME_CHANNEL_ID'
};

const websiteUrls = {
  website1: 'YOUR_WEBSITE_1_URL',
  website2: 'YOUR_WEBSITE_2_URL'
};

async function getPingStatus(client) {
  const pingChannel = client.channels.cache.get(channelIds.ping);
  if (!pingChannel) return console.log('Ping channel not found!');
  
  const ping = client.ws.ping;
  const embed = new EmbedBuilder()
    .setColor('Aqua')
    .setTitle('Bot Ping Status')
    .setDescription(`Latency: **${ping}ms**`);
  
  await pingChannel.messages.fetch({ limit: 1 }).then(messages => {
    const lastMessage = messages.first();
    if (lastMessage) {
      lastMessage.edit({ embeds: [embed] }).catch(err => console.error('Error editing ping message:', err));
    } else {
      pingChannel.send({ embeds: [embed] }).catch(err => console.error('Error sending new ping message:', err));
    }
  });
}

async function getWebsiteStatus(client, websiteKey) {
  const channel = client.channels.cache.get(channelIds[websiteKey]);
  if (!channel) return console.log(`${websiteKey} channel not found!`);

  let status = 'Offline 🔴';
  let color = 'Red';
  
  try {
    const response = await axios.get(websiteUrls[websiteKey]);
    if (response.status === 200) {
      status = 'Online 🟢';
      color = 'Green';
    }
  } catch (error) {
    console.error(`Error checking ${websiteKey}:`, error.message);
  }

  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(`Website Status for ${websiteKey.charAt(0).toUpperCase() + websiteKey.slice(1)}`)
    .setDescription(`Status: **${status}**`);

  await channel.messages.fetch({ limit: 1 }).then(messages => {
    const lastMessage = messages.first();
    if (lastMessage) {
      lastMessage.edit({ embeds: [embed] }).catch(err => console.error('Error editing website status message:', err));
    } else {
      channel.send({ embeds: [embed] }).catch(err => console.error('Error sending new website status message:', err));
    }
  });
}

async function updateMemberCounter(client) {
  const guild = client.guilds.cache.get('YOUR_GUILD_ID');
  if (!guild) return console.log('Guild not found!');

  const counterChannel = guild.channels.cache.get(channelIds.memberCounter);
  if (!counterChannel) return console.log('Member counter channel not found!');
  
  const memberCount = guild.memberCount;
  counterChannel.setName(`Members: ${memberCount}`).catch(err => console.error('Error updating member counter:', err));
}

export function startStatusUpdater(client) {
  // Update every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    console.log('Running scheduled status updates...');
    await getPingStatus(client);
    await getWebsiteStatus(client, 'website1');
    await getWebsiteStatus(client, 'website2');
  });

  // Update member counter every 1 minute
  cron.schedule('* * * * *', async () => {
    await updateMemberCounter(client);
  });
}

export async function handleWelcome(member) {
  const welcomeChannel = member.guild.channels.cache.get(channelIds.welcomeChannel);
  if (!welcomeChannel) return console.log('Welcome channel not found!');

  const welcomeEmbed = new EmbedBuilder()
    .setColor('Green')
    .setTitle(`Welcome to the server, ${member.user.tag}! 🎉`)
    .setDescription(`We're glad to have you! You are our **${member.guild.memberCount}** member.`);

  welcomeChannel.send({ embeds: [welcomeEmbed] }).catch(err => console.error('Error sending welcome message:', err));
}
