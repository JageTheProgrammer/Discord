import 'dotenv/config';
import { Client, Collection, GatewayIntentBits } from 'discord.js';
import mongoose from 'mongoose';
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
				client.commands.set(command.data.name, command);
			} else {
				console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
			}
		}
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
		await loadEvents();

		const mongoDbUri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.MONGODB_URL || process.env.DATABASE_URL;
		if (mongoDbUri) {
			await mongoose.connect(mongoDbUri);
			console.log('Connected to MongoDB!');
			// Ensure a safe partial unique index on email (enforces uniqueness only when email is a string)
			try {
				const usersColl = mongoose.connection.db.collection('users');
				const indexes = await usersColl.indexes();
				if (indexes.some((idx) => idx.name === 'email_1')) {
					await usersColl.dropIndex('email_1');
					console.log('Dropped existing index "email_1" to recreate as partial unique.');
				}
				await usersColl.createIndex({ email: 1 }, { name: 'email_1', unique: true, partialFilterExpression: { email: { $type: 'string' } } });
				console.log('Ensured partial unique index on users.email');
			} catch (idxErr) {
				console.warn('Index ensure skipped:', idxErr?.message || idxErr);
			}
		} else {
			console.warn('No MongoDB connection string found in env (MONGODB_URI/MONGO_URI/MONGODB_URL/DATABASE_URL). Skipping MongoDB connection.');
		}

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
