// deploy-commands.js
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
  const commands = [];
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

      command.category = folder.charAt(0).toUpperCase() + folder.slice(1);
      commands.push(command.data.toJSON());
    }
  }

  const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

  // ... (previous code)

try {
  console.log(`🛠️ Refreshing ${commands.length} application (/) commands...`);

  // Delete all existing global commands
  const currentCommands = await rest.get(
    Routes.applicationCommands(process.env.CLIENT_ID)
  );

  for (const cmd of currentCommands) {
    await rest.delete(Routes.applicationCommand(process.env.CLIENT_ID, cmd.id));
    console.log(`❌ Deleted old command: ${cmd.name}`);
  }

  // Define the deployment route based on the environment
  const isDev = process.env.NODE_ENV !== 'production' && process.env.GUILD_ID;
  const route = isDev
    ? Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID)
    : Routes.applicationCommands(process.env.CLIENT_ID);

  // Register new commands to either the test guild or globally
  await rest.put(route, { body: commands });

    // Log commands by category with emojis
    const grouped = {};
    commands.forEach(c => {
      const cat = c.category || 'Other';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(c.name);
    });

    console.log(`✅ Registered commands:`);
    for (const [cat, cmdNames] of Object.entries(grouped)) {
      const emoji = categoryEmojis[cat] || '';
      console.log(`${emoji} ${cat} (${cmdNames.length}): ${cmdNames.join(', ')}`);
    }

    console.log(`🎉 All commands successfully deployed!`);
  } catch (error) {
    console.error('❌ Error deploying commands:', error);
  }
}
