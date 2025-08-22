import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

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

    if (command?.data) {
      commands.push(command.data.toJSON());
    }
  }
}

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

try {
  console.log(`Started refreshing ${commands.length} application (/) commands.`);

  // Delete all existing global commands first
  const currentCommands = await rest.get(
    Routes.applicationCommands(process.env.CLIENT_ID)
  );
  for (const cmd of currentCommands) {
    await rest.delete(Routes.applicationCommand(process.env.CLIENT_ID, cmd.id));
    console.log(`Deleted old command: ${cmd.name}`);
  }

  // Register the new commands
  await rest.put(
    Routes.applicationCommands(process.env.CLIENT_ID),
    { body: commands }
  );

  console.log(`✅ Successfully registered ${commands.length} commands.`);
} catch (error) {
  console.error(error);
}
