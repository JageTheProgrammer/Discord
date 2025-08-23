import { SlashCommandBuilder } from 'discord.js';
import axios from 'axios';
import { createEmbed, UI_COLORS } from '../../utils/ui.js';

export default {
	data: new SlashCommandBuilder()
		.setName('packagist')
		.setDescription('Search PHP packages on Packagist')
		.addStringOption(o => o.setName('q').setDescription('Query').setRequired(true)),
	async execute(interaction) {
		const q = interaction.options.getString('q');
		await interaction.deferReply({ ephemeral: true });
		try {
			const { data } = await axios.get('https://packagist.org/search.json', { params: { q, per_page: 5 } });
			const results = data.results || [];
			if (!results.length) return interaction.editReply({ content: 'No packages found.' });
			const fields = results.map((r, i) => ({ name: `${i + 1}. ${r.name}`, value: `${r.description || '—'}\n[Packagist](https://packagist.org/packages/${r.name})` }));
			const embed = createEmbed({ title: `🐘 Packagist: ${q}`, fields, color: UI_COLORS.info });
			await interaction.editReply({ embeds: [embed] });
		} catch {
			await interaction.editReply({ content: 'Failed to search Packagist.' });
		}
	},
};

