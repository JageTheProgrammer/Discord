import 'dotenv/config';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord.js';

const TOKEN = process.env.BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const rest = new REST({ version: '10' }).setToken(TOKEN);

async function deleteGuildCommands() {
  try {
    console.log('Fetching guild commands...');
    const commands = await rest.get(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID));
    
    if (!commands.length) {
      console.log('No commands found in this guild.');
      return;
    }

    console.log(`Deleting ${commands.length} commands...`);

    for (const cmd of commands) {
      await rest.delete(Routes.applicationGuildCommand(CLIENT_ID, GUILD_ID, cmd.id));
      console.log(`✅ Deleted command: ${cmd.name}`);
    }

    console.log('✅ All guild commands deleted successfully!');
  } catch (err) {
    console.error('❌ Error deleting commands:', err);
  }
}

deleteGuildCommands();