import { SlashCommandBuilder } from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('json-validate')
		.setDescription('Validate JSON structure')
		.addStringOption(o => o.setName('json').setDescription('JSON string').setRequired(true)),
	async execute(interaction) {
		const json = interaction.options.getString('json');
		await interaction.deferReply({ ephemeral: true });
		try {
			const parsed = JSON.parse(json);
			const prettified = JSON.stringify(parsed, null, 2);
			await interaction.editReply({ content: `\u200b\n\u200b\n\u200b\n\`\`\`json\n${prettified.substring(0, 1900)}\n\`\`\`` });
		} catch (err) {
			await interaction.editReply({ content: 'Invalid JSON.' });
		}
	},
};

