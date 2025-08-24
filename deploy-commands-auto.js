import fs from 'node:fs';
import path from 'node:path';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import 'dotenv/config';

const commandsPath = path.join(process.cwd(), 'commands'); // adjust to your commands folder
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

const commands = [];
const skipped = [];
const fixed = [];

for (const file of commandFiles) {
  try {
    const commandModule = await import(path.join(commandsPath, file));
    const command = commandModule.default;

    if (!command?.data) {
      console.log(`⚠️ Skipped ${file}: no valid command data`);
      skipped.push(file);
      continue;
    }

    // Auto-fix required option order
    if (command.data.options) {
      const original = [...command.data.options];
      const requiredFirst = [...command.data.options].sort((a, b) => {
        const reqA = a.required ? 0 : 1;
        const reqB = b.required ? 0 : 1;
        return reqA - reqB;
      });

      if (JSON.stringify(original) !== JSON.stringify(requiredFirst)) {
        command.data.options = requiredFirst;
        fixed.push(file);
        console.log(`🔧 Fixed option order for ${file}`);
      }
    }

    commands.push(command.data.toJSON());
  } catch (err) {
    console.log(`❌ Skipped ${file}: import failed (${err.message})`);
    skipped.push(file);
  }
}

console.log(`Deploying ${commands.length} commands...`);

try {
  await rest.put(
    Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
    { body: commands }
  );
  console.log(`✅ Successfully deployed ${commands.length} commands!`);
  if (fixed.length) console.log(`🔧 Fixed commands:`, fixed.join(', '));
  if (skipped.length) console.log(`⚠️ Skipped commands:`, skipped.join(', '));
} catch (err) {
  console.error('❌ Failed to deploy commands:', err);
}
