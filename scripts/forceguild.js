import { REST, Routes } from 'discord.js';
import 'dotenv/config';

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

async function clearCommands() {
  try {
    console.log('Fetching guild commands...');
    const commands = await rest.get(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID)
    );
    console.log(`Deleting ${commands.length} commands...`);
    for (const cmd of commands) {
      await rest.delete(
        Routes.applicationGuildCommand(process.env.CLIENT_ID, process.env.GUILD_ID, cmd.id)
      );
    }
    console.log('All guild commands deleted.');
  } catch (err) {
    console.error(err);
  }
}

clearCommands();
