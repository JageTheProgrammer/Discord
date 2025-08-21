import { Collection, MessageFlags } from 'discord.js';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_DIR = path.join(__dirname, '../database');
const USERS_PATH = path.join(DB_DIR, 'users.json');

function loadUsers() {
	try {
		if (!existsSync(DB_DIR)) mkdirSync(DB_DIR, { recursive: true });
		if (!existsSync(USERS_PATH)) {
			writeFileSync(USERS_PATH, JSON.stringify({}, null, 2));
			return {};
		}
		const raw = readFileSync(USERS_PATH, 'utf8');
		return raw ? JSON.parse(raw) : {};
	} catch (err) {
		console.error('Failed to load users.json:', err);
		return {};
	}
}

function saveUsers(data) {
	try {
		writeFileSync(USERS_PATH, JSON.stringify(data, null, 2));
	} catch (err) {
		console.error('Failed to save users.json:', err);
	}
}

export default {
	name: 'interactionCreate',
	async execute(interaction) {
		const ensureUser = (discordId) => {
			const users = loadUsers();
			if (!users[discordId]) {
				users[discordId] = { discordId, commandsUsed: 0, joinedAt: Date.now() };
				saveUsers(users);
			}
			return users[discordId];
		};

		const handleCooldown = (command, userId) => {
			if (!interaction.client.cooldowns.has(command.name)) {
				interaction.client.cooldowns.set(command.name, new Collection());
			}

			const now = Date.now();
			const timestamps = interaction.client.cooldowns.get(command.name);
			const cooldownAmount = (command.cooldown || 3) * 1000;

			if (timestamps.has(userId)) {
				const expirationTime = timestamps.get(userId) + cooldownAmount;
				if (now < expirationTime) {
					const timeLeft = (expirationTime - now) / 1000;
					return `Please wait ${timeLeft.toFixed(1)} more seconds before using the \`${command.name}\` command.`;
				}
			}

			timestamps.set(userId, now);
			setTimeout(() => timestamps.delete(userId), cooldownAmount);
			return null;
		};

		if (!interaction.isChatInputCommand()) return;

		const command = interaction.client.commands.get(interaction.commandName);
		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return interaction.reply({ content: "This command doesn't exist!", flags: MessageFlags.Ephemeral });
		}

		try {
			ensureUser(interaction.user.id);
			const cooldownMessage = handleCooldown(command, interaction.user.id);
			if (cooldownMessage) {
				return interaction.reply({ content: cooldownMessage, flags: MessageFlags.Ephemeral });
			}
			await command.execute(interaction);
		} catch (error) {
			console.error('Error executing command:', error);
			const replyMessage = 'There was an error while executing this command!';
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: replyMessage, flags: MessageFlags.Ephemeral }).catch((err) => console.error('Error during followUp:', err));
			} else {
				try {
					await interaction.deferReply({ flags: MessageFlags.Ephemeral });
					await interaction.editReply({ content: replyMessage });
				} catch (err) {
					console.error('Error during reply:', err);
				}
			}
		}
	},
};
