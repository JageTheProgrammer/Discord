import { SlashCommandBuilder } from 'discord.js';
import axios from 'axios';
import { createEmbed, UI_COLORS } from '../../utils/ui.js';

export default {
	data: new SlashCommandBuilder()
		.setName('commit')
		.setDescription('Show commit details')
		.addStringOption(o => o.setName('repo').setDescription('owner/repo').setRequired(true))
		.addStringOption(o => o.setName('sha').setDescription('Commit SHA').setRequired(true)),
	async execute(interaction) {
		const repo = interaction.options.getString('repo');
		const sha = interaction.options.getString('sha');
		await interaction.deferReply({ ephemeral: true });
		try {
			const headers = { 'User-Agent': 'DiscordBot' };
			if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
			const { data } = await axios.get(`https://api.github.com/repos/${repo}/commits/${sha}`, { headers });
			const embed = createEmbed({
				title: `🧩 ${data.sha.substring(0,7)} — ${data.commit.message.split('\n')[0]}`,
				description: data.commit.message,
				color: UI_COLORS.primary,
				fields: [
					{ name: 'Author', value: `${data.commit.author.name} <${data.commit.author.email}>`, inline: true },
					{ name: 'Date', value: new Date(data.commit.author.date).toUTCString(), inline: true },
					{ name: 'URL', value: data.html_url },
				],
			});
			await interaction.editReply({ embeds: [embed] });
		} catch {
			await interaction.editReply({ content: 'Commit not found.' });
		}
	},
};

