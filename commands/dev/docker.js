import { SlashCommandBuilder } from 'discord.js';
import axios from 'axios';
import { createEmbed, UI_COLORS } from '../../utils/ui.js';

export default {
	data: new SlashCommandBuilder()
		.setName('docker')
		.setDescription('Search Docker Hub images')
		.addStringOption(o => o.setName('q').setDescription('Image query').setRequired(true)),
	async execute(interaction) {
		const q = interaction.options.getString('q');
		await interaction.deferReply({ ephemeral: true });
		try {
			const { data } = await axios.get('https://hub.docker.com/v2/search/repositories/', {
				params: { query: q, page_size: 5 },
			});
			const results = data?.results || [];
			if (!results.length) return interaction.editReply({ content: `No images for "${q}".` });
			const fields = results.map((it, i) => ({
				name: `${i + 1}. ${it.repo_name}`,
				value: `${it.short_description || 'No description'}\n⭐ ${it.star_count} • ⬇️ ${it.pull_count} • [Open](https://hub.docker.com/r/${it.repo_name})`,
			}));
			const embed = createEmbed({ title: `🐳 Docker Hub: ${q}`, fields, color: UI_COLORS.primary });
			await interaction.editReply({ embeds: [embed] });
		} catch (err) {
			await interaction.editReply({ content: 'Failed to fetch Docker Hub results.' });
		}
	},
};

