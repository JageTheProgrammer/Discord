import { SlashCommandBuilder } from 'discord.js';
import axios from 'axios';
import { createEmbed, UI_COLORS } from '../../utils/ui.js';

export default {
	data: new SlashCommandBuilder()
		.setName('stack')
		.setDescription('Search Stack Overflow for questions')
		.addStringOption(o => o.setName('q').setDescription('Search query').setRequired(true)),
	async execute(interaction) {
		const q = interaction.options.getString('q');
		await interaction.deferReply({ ephemeral: true });
		try {
			const { data } = await axios.get('https://api.stackexchange.com/2.3/search/advanced', {
				params: {
					order: 'desc',
					sort: 'relevance',
					site: 'stackoverflow',
					q,
					pagesize: 5,
				},
			});
			const items = Array.isArray(data.items) ? data.items : [];
			if (!items.length) {
				return interaction.editReply({ content: `No results for "${q}".` });
			}
			const fields = items.map((it, idx) => ({
				name: `${idx + 1}. ${it.title}`.slice(0, 256),
				value: `[Open](${it.link}) • Score: ${it.score} • Answers: ${it.answer_count}`.slice(0, 1024),
			}));
			const embed = createEmbed({
				title: `🔎 Stack Overflow: ${q}`,
				color: UI_COLORS.primary,
				fields,
			});
			await interaction.editReply({ embeds: [embed] });
		} catch (err) {
			await interaction.editReply({ content: 'Failed to fetch results from Stack Overflow.' });
		}
	},
};

