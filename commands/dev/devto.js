import { SlashCommandBuilder } from 'discord.js';
import axios from 'axios';
import { createEmbed, UI_COLORS } from '../../utils/ui.js';

export default {
	data: new SlashCommandBuilder()
		.setName('devto')
		.setDescription('Get recent posts from dev.to')
		.addIntegerOption(o => o.setName('limit').setDescription('How many (1-5)').setRequired(false)),
	async execute(interaction) {
		const limit = Math.max(1, Math.min(interaction.options.getInteger('limit') || 5, 5));
		await interaction.deferReply({ ephemeral: true });
		try {
			const { data } = await axios.get('https://dev.to/api/articles', { params: { per_page: limit } });
			const fields = data.slice(0, limit).map((p, i) => ({ name: `${i + 1}. ${p.title}`, value: `[Open](${p.url}) • ${p.readable_publish_date} • ❤️ ${p.public_reactions_count}` }));
			const embed = createEmbed({ title: '📰 dev.to — Recent Posts', fields, color: UI_COLORS.primary });
			await interaction.editReply({ embeds: [embed] });
		} catch {
			await interaction.editReply({ content: 'Failed to fetch dev.to posts.' });
		}
	},
};

