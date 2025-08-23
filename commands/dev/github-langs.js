import { SlashCommandBuilder } from 'discord.js';
import axios from 'axios';
import { createEmbed, UI_COLORS } from '../../utils/ui.js';

export default {
	data: new SlashCommandBuilder()
		.setName('github-langs')
		.setDescription('Show language breakdown for a repo')
		.addStringOption(o => o.setName('repo').setDescription('owner/repo').setRequired(true)),
	async execute(interaction) {
		const repo = interaction.options.getString('repo');
		await interaction.deferReply({ ephemeral: true });
		try {
			const headers = { 'User-Agent': 'DiscordBot' };
			if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
			const { data } = await axios.get(`https://api.github.com/repos/${repo}/languages`, { headers });
			const total = Object.values(data).reduce((a, b) => a + b, 0) || 1;
			const fields = Object.entries(data)
				.sort((a, b) => b[1] - a[1])
				.map(([lang, bytes]) => ({ name: lang, value: `${((bytes / total) * 100).toFixed(1)}%`, inline: true }));
			const embed = createEmbed({ title: `🗣️ Languages: ${repo}`, fields, color: UI_COLORS.info });
			await interaction.editReply({ embeds: [embed] });
		} catch {
			await interaction.editReply({ content: 'Failed to fetch languages.' });
		}
	},
};

