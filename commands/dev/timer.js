import { SlashCommandBuilder } from 'discord.js';
import { parseDuration } from '../../utils/time.js';

export default {
	data: new SlashCommandBuilder()
		.setName('timer')
		.setDescription('Start a simple countdown timer')
		.addStringOption(o => o.setName('for').setDescription('Duration, e.g., 30s, 5m').setRequired(true)),
	async execute(interaction) {
		const deltaStr = interaction.options.getString('for');
		const ms = parseDuration(deltaStr);
		if (!ms) return interaction.reply({ content: 'Invalid duration.', ephemeral: true });
		await interaction.reply({ content: `⏳ Timer started for ${deltaStr}. I will ping you when done.`, ephemeral: true });
		setTimeout(() => {
			interaction.followUp({ content: `⏰ ${interaction.user}, timer finished for ${deltaStr}!`, ephemeral: true }).catch(() => {});
		}, ms);
	},
};

