import { SlashCommandBuilder } from 'discord.js';
import axios from 'axios';
import { createEmbed, UI_COLORS } from '../../utils/ui.js';

export default {
	data: new SlashCommandBuilder()
		.setName('github-prs')
		.setDescription('List open PRs for a repository')
		.addStringOption(o => o.setName('repo').setDescription('owner/repo').setRequired(true))
		.addIntegerOption(o => o.setName('limit').setDescription('How many to show (1-10)').setRequired(false)),
	async execute(interaction) {
		const repo = interaction.options.getString('repo');
		const limit = Math.max(1, Math.min(interaction.options.getInteger('limit') || 5, 10));
		await interaction.deferReply({ ephemeral: true });
		try {
			const headers = { 'User-Agent': 'DiscordBot' };
			if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
			const { data } = await axios.get(`https://api.github.com/repos/${repo}/pulls`, { params: { state: 'open', per_page: limit }, headers });
			if (!data.length) return interaction.editReply({ content: 'No open PRs.' });
			const fields = data.map((it, i) => ({ name: `#${it.number} ${it.title}`.slice(0, 256), value: `[Open](${it.html_url}) • ${it.user.login} • 🟢 ${it.mergeable_state || 'unknown'}`.slice(0, 1024) }));
			const embed = createEmbed({ title: `🔀 PRs: ${repo}`, fields, color: UI_COLORS.primary });
			await interaction.editReply({ embeds: [embed] });
		} catch (err) {
			await interaction.editReply({ content: 'Failed to fetch PRs.' });
		}
	},
};

