import { SlashCommandBuilder } from 'discord.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
	data: new SlashCommandBuilder()
		.setName('snippet-list')
		.setDescription('List saved code snippets'),
	async execute(interaction) {
		const file = path.join(__dirname, '../../database/snippets.json');
		await interaction.deferReply({ ephemeral: true });
		try {
			const data = JSON.parse(readFileSync(file, 'utf8') || '[]');
			if (!data.length) return interaction.editReply({ content: 'No snippets saved.' });
			const names = data.map(s => `• ${s.name || 'unnamed'}`).slice(0, 30).join('\n');
			await interaction.editReply({ content: names });
		} catch {
			await interaction.editReply({ content: 'Failed to read snippets.' });
		}
	},
};

