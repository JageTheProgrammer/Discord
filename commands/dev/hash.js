import { SlashCommandBuilder } from 'discord.js';
import crypto from 'node:crypto';

export default {
	data: new SlashCommandBuilder()
		.setName('hash')
		.setDescription('Generate hash digest')
		.addStringOption(o => o.setName('algo').setDescription('Algorithm (md5, sha256, etc.)').setRequired(true))
		.addStringOption(o => o.setName('text').setDescription('Text to hash').setRequired(true)),
	async execute(interaction) {
		const algo = interaction.options.getString('algo');
		const text = interaction.options.getString('text');
		await interaction.deferReply({ ephemeral: true });
		try {
			const digest = crypto.createHash(algo).update(text).digest('hex');
			await interaction.editReply({ content: `\`${algo}\`: ${digest}` });
		} catch {
			await interaction.editReply({ content: 'Invalid algorithm.' });
		}
	},
};

