import { SlashCommandBuilder } from 'discord.js';
import axios from 'axios';
import { createEmbed, UI_COLORS } from '../../utils/ui.js';

export default {
	data: new SlashCommandBuilder()
		.setName('github-user')
		.setDescription('Get GitHub user info')
		.addStringOption(o => o.setName('username').setDescription('GitHub username').setRequired(true)),
	async execute(interaction) {
		const username = interaction.options.getString('username');
		await interaction.deferReply({ ephemeral: true });
		try {
			const headers = { 'User-Agent': 'DiscordBot' };
			if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
			const { data } = await axios.get(`https://api.github.com/users/${encodeURIComponent(username)}`, { headers });
			const embed = createEmbed({
				title: `👤 ${data.login}`,
				description: data.bio || '—',
				thumbnail: data.avatar_url,
				color: UI_COLORS.primary,
				fields: [
					{ name: 'Name', value: data.name || '—', inline: true },
					{ name: 'Repos', value: String(data.public_repos), inline: true },
					{ name: 'Followers', value: String(data.followers), inline: true },
					{ name: 'Profile', value: `[Open](${data.html_url})` },
				],
			});
			await interaction.editReply({ embeds: [embed] });
		} catch (err) {
			await interaction.editReply({ content: 'User not found.' });
		}
	},
};

