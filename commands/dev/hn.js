import { SlashCommandBuilder } from 'discord.js';
import axios from 'axios';
import { createEmbed, UI_COLORS } from '../../utils/ui.js';

export default {
	data: new SlashCommandBuilder()
		.setName('hn')
		.setDescription('Latest Hacker News front-page stories')
		.addIntegerOption(o => o.setName('limit').setDescription('How many (1-5)').setRequired(false)),
	async execute(interaction) {
		const limit = Math.max(1, Math.min(interaction.options.getInteger('limit') || 5, 5));
		await interaction.deferReply({ ephemeral: true });
		try {
			const { data } = await axios.get('https://hn.algolia.com/api/v1/search', { params: { tags: 'front_page' } });
			const hits = data.hits?.slice(0, limit) || [];
			const fields = hits.map((h, i) => ({ name: `${i + 1}. ${h.title}`, value: `[Open](${h.url || `https://news.ycombinator.com/item?id=${h.objectID}`}) • 👍 ${h.points}` }));
			const embed = createEmbed({ title: '🗞️ Hacker News — Front Page', fields, color: UI_COLORS.primary });
			await interaction.editReply({ embeds: [embed] });
		} catch {
			await interaction.editReply({ content: 'Failed to fetch HN stories.' });
		}
	},
};

