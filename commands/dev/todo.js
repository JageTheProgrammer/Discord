import { SlashCommandBuilder } from 'discord.js';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FILE = path.join(__dirname, '../../database/todos.json');

function readTodos() {
	try {
		return JSON.parse(readFileSync(FILE, 'utf8') || '[]');
	} catch {
		return [];
	}
}
function writeTodos(list) {
	writeFileSync(FILE, JSON.stringify(list, null, 2), 'utf8');
}

export default {
	data: new SlashCommandBuilder()
		.setName('todo')
		.setDescription('Personal TODOs')
		.addSubcommand(sc => sc.setName('add').setDescription('Add an item').addStringOption(o => o.setName('text').setDescription('Item text').setRequired(true)))
		.addSubcommand(sc => sc.setName('list').setDescription('List items'))
		.addSubcommand(sc => sc.setName('done').setDescription('Mark item done').addIntegerOption(o => o.setName('index').setDescription('Index from list').setRequired(true)))
	,
	async execute(interaction) {
		const sub = interaction.options.getSubcommand();
		const userId = interaction.user.id;
		const all = readTodos();
		const todos = all.find(x => x.userId === userId) || { userId, items: [] };
		if (!all.includes(todos)) all.push(todos);
		if (sub === 'add') {
			const text = interaction.options.getString('text');
			todos.items.push({ text, done: false, at: Date.now() });
			writeTodos(all);
			return interaction.reply({ content: 'Added.', ephemeral: true });
		}
		if (sub === 'list') {
			const lines = todos.items.map((it, i) => `${i + 1}. ${it.done ? '✅' : '⬜'} ${it.text}`);
			return interaction.reply({ content: lines.join('\n') || 'Empty.', ephemeral: true });
		}
		if (sub === 'done') {
			const index = interaction.options.getInteger('index') - 1;
			if (index < 0 || index >= todos.items.length) return interaction.reply({ content: 'Invalid index.', ephemeral: true });
			todos.items[index].done = true;
			writeTodos(all);
			return interaction.reply({ content: 'Marked as done.', ephemeral: true });
		}
	},
};

