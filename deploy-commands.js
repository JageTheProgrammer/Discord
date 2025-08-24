import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import { readdirSync, statSync } from 'node:fs';
import path, { join } from 'node:path';
import { pathToFileURL } from 'node:url';

// category emojis
const categoryEmojis = {
  Fun: '🎉',
  Moderation: '🔨',
  Community: '🌐',
  Dev: '💻',
  Infra: '🛠️',
};

// recursive loader for commands
function getCommandFiles(dir) {
  let files = [];
  for (const f of readdirSync(dir)) {
    const full = join(dir, f);
    if (statSync(full).isDirectory()) {
      files = files.concat(getCommandFiles(full));
    } else if (f.endsWith('.js')) {
      files.push(full);
    }
  }
  return files;
}

// main deploy function
export default async function deployCommands() {
  const commands = [];
  const categorized = [];
  const commandsPath = path.join(process.cwd(), 'commands');

  const allFiles = getCommandFiles(commandsPath);

  for (const filePath of allFiles) {
    const moduleUrl = pathToFileURL(filePath).href;
    let imported;
    try {
      imported = await import(moduleUrl);
    } catch (err) {
      console.log(`⚠️ Failed to import ${filePath}, skipping. Error: ${err.message}`);
      continue;
    }

    const command = imported.default ?? imported;

    if (!command?.data || !command?.execute) {
      console.log(`⚠️ Skipping invalid command: ${filePath}`);
      continue;
    }

    // skip command #44 / regex-test
    if (command.data.name === 'regex-test') {
      console.log(`⏩ Skipping command: ${command.data.name}`);
      continue;
    }

    const folder = filePath.split(path.sep).slice(-2, -1)[0];
    const category = folder.charAt(0).toUpperCase() + folder.slice(1);

    if (commands.some(c => c.name === command.data.name)) {
      console.log(`⚠️ Skipping duplicate: ${command.data.name}`);
      continue;
    }

    categorized.push({ ...command, category });
    commands.push(command.data.toJSON());
  }

  console.log(`🛠️ Deploying ${commands.length} commands...`);

  const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

  try {
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });

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

// allow running via `node deploy-commands.js`
if (import.meta.url === `file://${process.argv[1]}`) {
  deployCommands();
}
