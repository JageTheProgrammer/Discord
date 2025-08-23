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
};

const ALLOWED_FOLDERS = ['community', 'dev', 'fun', 'infra', 'moderation'];

export default async function deployCommands() {
  const commands = [];
  const categorized = [];

  const commandsPath = path.join(process.cwd(), 'commands');
  const commandFolders = readdirSync(commandsPath).filter(f =>
    ALLOWED_FOLDERS.includes(f.toLowerCase())
  );

  for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);
    const commandFiles = readdirSync(folderPath).filter(f => f.endsWith('.js'));

    for (const file of commandFiles) {
      const filePath = path.join(folderPath, file);
      const moduleUrl = pathToFileURL(filePath).href;
      const imported = await import(moduleUrl);
      const command = imported.default ?? imported;

      if (!command?.data || !command?.execute) continue;

      const category = folder.charAt(0).toUpperCase() + folder.slice(1);

      // prevent duplicate command names
      if (commands.some(c => c.name === command.data.name)) {
        console.log(`⚠️ Skipping duplicate: ${command.data.name}`);
        continue;
      }

      categorized.push({ ...command, category });
      commands.push(command.data.toJSON());
    }
  }

  const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

  try {
    console.log(`🛠️ Deploying ${commands.length} global (/) commands...`);

    const route = Routes.applicationCommands(process.env.CLIENT_ID);

    // overwrite everything in one go → no leftovers
    await rest.put(route, { body: commands });

    // log grouped by category
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

    console.log(`🎉 All commands successfully deployed globally!`);
  } catch (error) {
    console.error('❌ Error deploying commands:', error);
  }
}

// Allow running via `node deploy-commands.js`
if (import.meta.url === `file://${process.argv[1]}`) {
  deployCommands();
}
