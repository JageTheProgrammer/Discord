import { SlashCommandBuilder } from 'discord.js';
import axios from 'axios';
import { createEmbed, UI_COLORS } from '../../utils/ui.js';

export default {
	data: new SlashCommandBuilder()
		.setName('github-repo')
		.setDescription('Get GitHub repository info')
		.addStringOption(o => o.setName('repo').setDescription('owner/repo').setRequired(true)),
	async execute(interaction) {
		const repo = interaction.options.getString('repo');
		await interaction.deferReply({ ephemeral: true });
		try {
			const headers = { 'User-Agent': 'DiscordBot' };
			if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
			const { data } = await axios.get(`https://api.github.com/repos/${repo}`, { headers });
			const embed = createEmbed({
				title: `📦 ${data.full_name}`,
				description: data.description || '—',
				color: UI_COLORS.info,
				fields: [
					{ name: 'Stars', value: String(data.stargazers_count), inline: true },
					{ name: 'Forks', value: String(data.forks_count), inline: true },
					{ name: 'Issues', value: String(data.open_issues_count), inline: true },
					{ name: 'Links', value: `[Repo](${data.html_url})${data.homepage ? ` • [Home](${data.homepage})` : ''}` },
				],
			});
			await interaction.editReply({ embeds: [embed] });
		} catch (err) {
			await interaction.editReply({ content: 'Repository not found.' });
		}
	},
};

