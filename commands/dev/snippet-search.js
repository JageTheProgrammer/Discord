import { SlashCommandBuilder } from 'discord.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
	data: new SlashCommandBuilder()
		.setName('snippet-search')
		.setDescription('Search saved code snippets')
		.addStringOption(o => o.setName('q').setDescription('Search query').setRequired(true)),
	async execute(interaction) {
		const q = interaction.options.getString('q').toLowerCase();
		const file = path.join(__dirname, '../../database/snippets.json');
		await interaction.deferReply({ ephemeral: true });
		try {
			const data = JSON.parse(readFileSync(file, 'utf8') || '[]');
			const matches = data.filter(s => (s.name || '').toLowerCase().includes(q) || (s.content || '').toLowerCase().includes(q)).slice(0, 5);
			if (!matches.length) return interaction.editReply({ content: 'No matches.' });
			const out = matches.map(s => `• ${s.name || 'unnamed'}`).join('\n');
			await interaction.editReply({ content: out });
		} catch {
			await interaction.editReply({ content: 'Failed to search snippets.' });
		}
	},
};

