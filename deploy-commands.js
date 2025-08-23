import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const categoryEmojis = {
  Fun: '🎉',
  Moderation: '🔨',
  Community: '🌐',
  Dev: '💻',
  Infra: '🛠️',
  Other: '📦',
};

export default async function deployCommands() {
  const startedAt = Date.now();
  const commands = [];
  const categorized = [];

  const commandsPath = path.join(process.cwd(), 'commands');
  const commandFolders = readdirSync(commandsPath);

  for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);
    const commandFiles = readdirSync(folderPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
      const filePath = path.join(folderPath, file);
      const moduleUrl = pathToFileURL(filePath).href;
      const imported = await import(moduleUrl);
      const command = imported.default ?? imported;

      if (!command?.data) continue;

      const category = folder.charAt(0).toUpperCase() + folder.slice(1);
      categorized.push({ ...command, category });
      commands.push(command.data.toJSON());
    }
  }

  const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

  // Verbose logging to help diagnose hangs
  rest.on?.('rateLimited', (info) => console.warn('⚠️ Rate limited:', info));
  rest.on?.('invalidRequestWarning', (info) => console.warn('⚠️ Invalid request warning:', info));

  try {
    const guildId = process.env.DEPLOY_GUILD_ID;
    const scope = guildId ? `guild ${guildId}` : 'global';
    console.log(`🛠️ Refreshing ${commands.length} ${scope} (/) commands...`);

    const route = guildId
      ? Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId)
      : Routes.applicationCommands(process.env.CLIENT_ID);

    // Abort if Discord API is unreachable for too long
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
      console.error('❌ Timed out waiting for Discord API. Check network/DNS connectivity.');
    }, 30000);

    // Atomic replace of commands (no manual delete loop)
    const result = await rest.put(route, { body: commands, signal: controller.signal });
    clearTimeout(timeout);

    // Group by category
    const grouped = {};
    categorized.forEach(c => {
      const cat = c.category || 'Other';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(c.data.name);
    });

    console.log(`✅ Registered commands:`);
    for (const [cat, cmdNames] of Object.entries(grouped)) {
      const emoji = categoryEmojis[cat] || '';
      console.log(`${emoji} ${cat} (${cmdNames.length}): ${cmdNames.join(', ')}`);
    }

    const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
    console.log(`🎉 Successfully deployed ${result.length} commands to ${scope} in ${elapsed}s.`);

    if (!guildId) {
      console.log('ℹ️ Global commands can take up to 1 hour to propagate. Use DEPLOY_GUILD_ID for instant testing.');
    }
  } catch (error) {
    console.error('❌ Error deploying commands:');
    if (error?.response?.data) {
      console.error(JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error);
    }
    process.exitCode = 1;
  }
}

// Allow running via `node deploy-commands.js`
if (import.meta.url === `file://${process.argv[1]}`) {
  if (!process.env.BOT_TOKEN || !process.env.CLIENT_ID) {
    console.error('Missing BOT_TOKEN or CLIENT_ID in environment. Check your .env');
    process.exit(1);
  }
  deployCommands();
}