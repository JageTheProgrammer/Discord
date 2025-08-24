import 'dotenv/config';
import { Client, Collection, GatewayIntentBits } from 'discord.js';
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import express from 'express';

// Global error handlers
process.on('unhandledRejection', console.error);
process.on('uncaughtException', console.error);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

// Collections
client.commands = new Collection();
client.cooldowns = new Collection();

// Load commands
async function loadCommands() {
  const commandsPath = path.join(__dirname, 'commands');
  const folders = readdirSync(commandsPath);

  for (const folder of folders) {
    const folderPath = path.join(commandsPath, folder);
    const files = readdirSync(folderPath).filter(f => f.endsWith('.js'));
    for (const file of files) {
      try {
        const moduleUrl = pathToFileURL(path.join(folderPath, file)).href;
        const imported = await import(moduleUrl);
        const command = imported.default ?? imported;

        if (!command?.data || !command?.execute) continue;

        command.category = folder.charAt(0).toUpperCase() + folder.slice(1);
        client.commands.set(command.data.name, command);
      } catch (err) {
        console.error(`[ERROR] Failed to load command ${file}:`, err);
      }
    }
  }
}

// Load events
async function loadEvents() {
  const eventsPath = path.join(__dirname, 'events');
  const files = readdirSync(eventsPath).filter(f => f.endsWith('.js'));

  for (const file of files) {
    const moduleUrl = pathToFileURL(path.join(eventsPath, file)).href;
    const imported = await import(moduleUrl);
    const event = imported.default ?? imported;

    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args).catch(console.error));
    } else {
      client.on(event.name, (...args) => event.execute(...args).catch(console.error));
    }
  }
}

// Start bot
async function start() {
  try {
    await loadCommands();
    await loadEvents();

    if (!process.env.BOT_TOKEN) throw new Error('BOT_TOKEN not set');
    await client.login(process.env.BOT_TOKEN);
    console.log(`✅ Bot logged in as ${client.user.tag}`);

    // Express health server
    const app = express();
    app.get('/', (req, res) => res.send('🤖 Discord bot is running!'));
    app.get('/ping', (req, res) => res.status(200).send('🤖 Bot is alive!'));
    app.get('/healthz', (req, res) => {
      res.json({
        ok: true,
        uptime: process.uptime(),
        wsPing: client.ws.ping,
        guilds: client.guilds.cache.size,
        memoryRss: process.memoryUsage().rss,
        node: process.version,
      });
    });

    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => console.log(`🌐 Web server listening on port ${PORT}`));
  } catch (err) {
    console.error('❌ Failed to start bot:', err);
    process.exit(1);
  }
}

start();
