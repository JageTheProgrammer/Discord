// index.js
import 'dotenv/config';
import { Client, Collection, GatewayIntentBits } from 'discord.js';
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import express from 'express';
import { startStatusUpdater, handleWelcome } from './utils/statusUpdater.js';

// 🔒 Global error handlers
process.on('unhandledRejection', console.error);
process.on('uncaughtException', console.error);

const token = process.env.DISCORD_TOKEN;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers // We need this for the welcome message
  ],
});

client.cooldowns = new Collection();
client.commands = new Collection();

async function loadCommands() {
  const commandsPath = path.join(__dirname, 'commands');
  const commandFolders = readdirSync(commandsPath);

  for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);

    if (!readdirSync(folderPath, { withFileTypes: true }).some(f => f.isFile())) continue;

    const commandFiles = readdirSync(folderPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
      try {
        const filePath = path.join(folderPath, file);
        const moduleUrl = pathToFileURL(filePath).href;
        const imported = await import(moduleUrl);
        const command = imported.default ?? imported;

        if (!command?.data || !command?.execute) {
          console.log(`[WARNING] Command at ${filePath} is missing required "data" or "execute". Skipping.`);
          continue;
        }

        command.category = folder.charAt(0).toUpperCase() + folder.slice(1);
        client.commands.set(command.data.name, command);

        console.log(`✅ Loaded command: ${command.data.name} (${command.category})`);
      } catch (err) {
        console.error(`[ERROR] Failed to load command ${file}:`, err);
      }
    }
  }
}

async function loadEvents() {
  const eventsPath = path.join(__dirname, 'events');
  const eventFiles = readdirSync(eventsPath).filter(file => file.endsWith('.js'));
  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const moduleUrl = pathToFileURL(filePath).href;
    const imported = await import(moduleUrl);
    const event = imported.default ?? imported;
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args).catch(console.error));
    } else {
      client.on(event.name, (...args) => event.execute(...args).catch(console.error));
    }
  }
}

async function start() {
  try {
    // 1️⃣ Deploy commands at startup
    try {
      const deployModule = await import('./deploy-commands.js');
      if (deployModule.default) await deployModule.default();
      console.log('✅ Commands deployed successfully.');
    } catch (deployErr) {
      console.error('❌ Failed to deploy commands:', deployErr);
    }

    // 2️⃣ Load commands locally
    await loadCommands();

    // 3️⃣ Load events
    await loadEvents();

    // 4️⃣ Login bot
    const token = process.env.BOT_TOKEN;
    if (!token) throw new Error('BOT_TOKEN is not set.');

    await client.login(token);
    console.log('Bot logged in successfully! ✅');

    // 5️⃣ Express server
    const app = express();

    // Root endpoint
    app.get('/', (req, res) => res.send('🤖 Discord bot is running!'));

    // ✅ Ping endpoint for Render / Uptime Robot
    app.get('/ping', (req, res) => res.status(200).send('🤖 Bot is alive!'));

    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => console.log(`Web server listening on port ${PORT}`));

  } catch (err) {
    console.error('Failed to start bot:', err);
    process.exit(1);
  }
}

client.once('ready', () => {
    console.log(`Ready! Logged in as ${client.user.tag}`);
    // Start the scheduled tasks once the bot is ready
    startStatusUpdater(client);
});

client.on('guildMemberAdd', (member) => {
    handleWelcome(member);
});

start();
