import { SlashCommandBuilder } from 'discord.js';
import axios from 'axios';
import { createEmbed, UI_COLORS } from '../../utils/ui.js';

export default {
	data: new SlashCommandBuilder()
		.setName('ci-status')
		.setDescription('Check GitHub Actions workflow runs for a repo')
		.addStringOption(o => o.setName('repo').setDescription('owner/repo').setRequired(true)),
	async execute(interaction) {
		const repo = interaction.options.getString('repo');
		await interaction.deferReply({ ephemeral: true });
		try {
			const headers = { 'User-Agent': 'DiscordBot' };
			if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
			const { data } = await axios.get(`https://api.github.com/repos/${repo}/actions/runs`, { headers, params: { per_page: 5 } });
			const runs = data.workflow_runs || [];
			if (!runs.length) return interaction.editReply({ content: 'No workflow runs found.' });
			const fields = runs.map(r => ({ name: r.name || 'Workflow', value: `${r.status}/${r.conclusion || '—'} • ${new Date(r.created_at).toUTCString()} • [Run](${r.html_url})` }));
			const embed = createEmbed({ title: `⚙️ CI Status: ${repo}`, fields, color: UI_COLORS.primary });
			await interaction.editReply({ embeds: [embed] });
		} catch {
			await interaction.editReply({ content: 'Failed to fetch CI status.' });
		}
	},
};

