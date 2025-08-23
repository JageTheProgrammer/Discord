import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RANKS_PATH = path.join(__dirname, '../database/ranks.json');
const COOLDOWN_MS = 60_000; // 1 minute per user to gain XP
const MIN_XP = 5;
const MAX_XP = 15;

const userLastXpTimestamp = new Map();

function readRanks() {
	try {
		const data = readFileSync(RANKS_PATH, 'utf8');
		return JSON.parse(data || '{}');
	} catch {
		return {};
	}
}

function writeRanks(ranks) {
	try {
		writeFileSync(RANKS_PATH, JSON.stringify(ranks, null, 2), 'utf8');
	} catch (err) {
		console.error('Failed to write ranks.json:', err);
	}
}

function getRequiredXpForLevel(level) {
	// Simple curve: 100 * level^2
	return 100 * level * level;
}

export default {
	name: 'messageCreate',
	async execute(message) {
		if (message.author.bot) return;
		if (!message.guild) return;

		const now = Date.now();
		const last = userLastXpTimestamp.get(message.author.id) || 0;
		if (now - last < COOLDOWN_MS) return;
		userLastXpTimestamp.set(message.author.id, now);

		const gainedXp = Math.floor(Math.random() * (MAX_XP - MIN_XP + 1)) + MIN_XP;
		const ranks = readRanks();
		if (!ranks[message.author.id]) {
			ranks[message.author.id] = { xp: 0, level: 1 };
		}

		const user = ranks[message.author.id];
		user.xp += gainedXp;

		// Level up check
		let leveledUp = false;
		while (user.xp >= getRequiredXpForLevel(user.level)) {
			user.level += 1;
			leveledUp = true;
		}

		writeRanks(ranks);

		if (leveledUp) {
			// Silent level up to avoid spam; could DM or send to a channel if desired
			// message.channel.send({ content: `🎉 ${message.author} leveled up to **Level ${user.level}**!` }).catch(() => {});
		}
	},
};

