import { SlashCommandBuilder } from 'discord.js';
import { createEmbed, UI_COLORS } from '../../utils/ui.js';

export default {
	data: new SlashCommandBuilder()
		.setName('regex-test')
		.setDescription('Test a regex against input text')
		.addStringOption(o => o.setName('pattern').setDescription('Regex pattern, without slashes').setRequired(true))
		.addStringOption(o => o.setName('text').setDescription('Text to test').setRequired(true))
		.addStringOption(o => o.setName('flags').setDescription('Regex flags, e.g. gim').setRequired(false)),
	async execute(interaction) {
		const pattern = interaction.options.getString('pattern');
		const flags = interaction.options.getString('flags') || '';
		const text = interaction.options.getString('text');
		await interaction.deferReply({ ephemeral: true });
		try {
			const re = new RegExp(pattern, flags);
			const matches = Array.from(text.matchAll(re)).slice(0, 10);
			const preview = matches.length ? matches.map((m, i) => `#${i + 1}: ${m[0]}`).join('\n') : 'No matches';
			const embed = createEmbed({
				title: '🧪 Regex Test',
				fields: [
					{ name: 'Pattern', value: `/${pattern}/${flags || ''}` },
					{ name: 'Matches', value: preview.slice(0, 1024) },
				],
				color: UI_COLORS.info,
			});
			await interaction.editReply({ embeds: [embed] });
		} catch (err) {
			await interaction.editReply({ content: 'Invalid regex pattern or flags.' });
		}
	},
};

