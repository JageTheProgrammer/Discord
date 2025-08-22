import 'dotenv/config';
import { Client, Collection, GatewayIntentBits } from 'discord.js';
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import express from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

client.cooldowns = new Collection();
client.commands = new Collection();

async function loadCommands() {
  const commandsPath = path.join(__dirname, 'commands');
  const commandFolders = readdirSync(commandsPath);

  for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);

    // Only process folders
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

        // Set category based on folder name
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
  const eventFiles = readdirSync(eventsPath).filter((file) => file.endsWith('.js'));
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
    await loadCommands();
    await loadEvents();

    const token = process.env.BOT_TOKEN;
    if (!token) {
      console.error('BOT_TOKEN is not set. Please configure your environment variables.');
      process.exit(1);
    }

    await client.login(token);
    console.log('Bot logged in successfully! ✅');

    // Minimal Express server so Render keeps it alive
    const app = express();
    app.get('/', (req, res) => res.send('🤖 Discord bot is running!'));
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Web server listening on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start bot:', err);
    process.exit(1);
  }
}

start();
