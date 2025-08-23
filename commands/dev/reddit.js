import { SlashCommandBuilder } from 'discord.js';
import axios from 'axios';
import { createEmbed, UI_COLORS } from '../../utils/ui.js';

const SUBS = ['webdev', 'programming', 'javascript', 'learnprogramming'];

export default {
	data: new SlashCommandBuilder()
		.setName('reddit')
		.setDescription('Top posts from developer subreddits')
		.addStringOption(o => o.setName('sub').setDescription('Subreddit (optional)').setRequired(false))
		.addIntegerOption(o => o.setName('limit').setDescription('How many (1-5)').setRequired(false)),
	async execute(interaction) {
		const subArg = interaction.options.getString('sub');
		const sub = subArg ? subArg.replace(/^r\//i, '') : SUBS[Math.floor(Math.random() * SUBS.length)];
		const limit = Math.max(1, Math.min(interaction.options.getInteger('limit') || 5, 5));
		await interaction.deferReply({ ephemeral: true });
		try {
			const { data } = await axios.get(`https://www.reddit.com/r/${encodeURIComponent(sub)}/top.json`, { params: { t: 'day', limit } });
			const posts = data.data.children || [];
			if (!posts.length) return interaction.editReply({ content: 'No posts found.' });
			const fields = posts.map((p, i) => ({ name: `${i + 1}. ${p.data.title}`.slice(0, 256), value: `[Open](https://reddit.com${p.data.permalink}) • 👍 ${p.data.ups}`.slice(0, 1024) }));
			const embed = createEmbed({ title: `👽 r/${sub} — Top Today`, fields, color: UI_COLORS.info });
			await interaction.editReply({ embeds: [embed] });
		} catch {
			await interaction.editReply({ content: 'Failed to fetch Reddit posts.' });
		}
	},
};

