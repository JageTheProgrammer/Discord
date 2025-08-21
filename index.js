import 'dotenv/config';
import { Client, Collection, GatewayIntentBits, REST, Routes } from 'discord.js';
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.cooldowns = new Collection();
client.commands = new Collection();

async function loadCommands() {
	const commandsPath = path.join(__dirname, 'commands');
	const commandFolders = readdirSync(commandsPath);
	for (const folder of commandFolders) {
		const folderPath = path.join(commandsPath, folder);
		const commandFiles = readdirSync(folderPath).filter((file) => file.endsWith('.js'));
		for (const file of commandFiles) {
			const filePath = path.join(folderPath, file);
			const moduleUrl = pathToFileURL(filePath).href;
			const imported = await import(moduleUrl);
			const command = imported.default ?? imported;
			if (command && 'data' in command && 'execute' in command) {
				// Prefix dev commands to group them in the slash command picker
				if (folder === 'dev') {
					const originalName = command.data.name;
					if (!originalName.startsWith('dev-')) {
						command.data.setName(`dev-${originalName}`);
					}
				}
				client.commands.set(command.data.name, command);
			} else {
				console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
			}
		}
	}
}

async function registerCommands() {
	const token = process.env.BOT_TOKEN;
	const clientId = process.env.CLIENT_ID;
	const guildId = process.env.GUILD_ID; // optional
	if (!token || !clientId) {
		console.warn('Skipping command registration: BOT_TOKEN and/or CLIENT_ID missing.');
		return;
	}
	const rest = new REST({ version: '10' }).setToken(token);
	const body = Array.from(client.commands.values()).map((c) => c.data.toJSON());
	try {
		console.log(`Registering ${body.length} application (/) commands ${guildId ? `(guild ${guildId})` : '(global)' } ...`);
		const route = guildId ? Routes.applicationGuildCommands(clientId, guildId) : Routes.applicationCommands(clientId);
		await rest.put(route, { body });
		console.log('Commands registered successfully (old commands replaced).');
	} catch (err) {
		console.error('Failed to register commands:', err);
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
		await registerCommands();
		await loadEvents();

		const token = process.env.BOT_TOKEN;
		if (!token) {
			console.error('BOT_TOKEN is not set. Please configure your environment variables.');
			process.exit(1);
		}

		await client.login(token);
	} catch (err) {
		console.error('Failed to start bot:', err);
		process.exit(1);
	}
}

start();
