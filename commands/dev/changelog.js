import { SlashCommandBuilder } from 'discord.js';
import axios from 'axios';
import { createEmbed, UI_COLORS } from '../../utils/ui.js';

export default {
	data: new SlashCommandBuilder()
		.setName('changelog')
		.setDescription('Show latest releases for a repo')
		.addStringOption(o => o.setName('repo').setDescription('owner/repo').setRequired(true))
		.addIntegerOption(o => o.setName('limit').setDescription('How many (1-5)').setRequired(false)),
	async execute(interaction) {
		const repo = interaction.options.getString('repo');
		const limit = Math.max(1, Math.min(interaction.options.getInteger('limit') || 3, 5));
		await interaction.deferReply({ ephemeral: true });
		try {
			const headers = { 'User-Agent': 'DiscordBot' };
			if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
			const { data } = await axios.get(`https://api.github.com/repos/${repo}/releases`, { headers, params: { per_page: limit } });
			if (!data.length) return interaction.editReply({ content: 'No releases found.' });
			const fields = data.slice(0, limit).map(r => ({ name: `${r.name || r.tag_name}`, value: `${new Date(r.published_at).toUTCString()} • [Notes](${r.html_url})` }));
			const embed = createEmbed({ title: `📝 Changelog: ${repo}`, fields, color: UI_COLORS.info });
			await interaction.editReply({ embeds: [embed] });
		} catch {
			await interaction.editReply({ content: 'Failed to fetch releases.' });
		}
	},
};

