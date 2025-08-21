import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFolders = readdirSync(commandsPath);

for (const folder of commandFolders) {
	const commandFiles = readdirSync(path.join(commandsPath, folder)).filter((file) => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, folder, file);
		const moduleUrl = pathToFileURL(filePath).href;
		const imported = await import(moduleUrl);
		const command = imported.default ?? imported;
		if ('data' in command && 'execute' in command) {
			commands.push(command.data.toJSON());
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const token = process.env.BOT_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID; // Optional: if not provided, deploy globally

if (!token || !clientId) {
	console.error('BOT_TOKEN and CLIENT_ID must be set in environment variables.');
	process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(token);

try {
	console.log(`Started refreshing ${commands.length} application (/) commands.`);
	const route = guildId
		? Routes.applicationGuildCommands(clientId, guildId)
		: Routes.applicationCommands(clientId);
	const data = await rest.put(route, { body: commands });
	console.log(`Successfully reloaded ${Array.isArray(data) ? data.length : 0} application (/) commands.`);
} catch (error) {
	console.error(error);
	process.exit(1);
}