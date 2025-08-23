import { SlashCommandBuilder } from 'discord.js';
import axios from 'axios';

export default {
	data: new SlashCommandBuilder()
		.setName('api-test')
		.setDescription('Make a test HTTP GET request to an API')
		.addStringOption(o => o.setName('url').setDescription('URL to fetch').setRequired(true)),
	async execute(interaction) {
		const url = interaction.options.getString('url');
		await interaction.deferReply({ ephemeral: true });
		try {
			const res = await axios.get(url);
			const body = typeof res.data === 'string' ? res.data : JSON.stringify(res.data, null, 2);
			await interaction.editReply({ content: `Status: ${res.status}\n\`\`\`json\n${body.substring(0, 1800)}\n\`\`\`` });
		} catch (err) {
			const status = err.response?.status || 'Request failed';
			const body = err.response?.data;
			const preview = typeof body === 'string' ? body : JSON.stringify(body, null, 2);
			await interaction.editReply({ content: `Error: ${status}\n\`\`\`\n${(preview || String(err.message)).substring(0, 1800)}\n\`\`\`` });
		}
	},
};

