import { SlashCommandBuilder } from 'discord.js';

const LOREM = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';

export default {
	data: new SlashCommandBuilder()
		.setName('lorem')
		.setDescription('Generate placeholder text')
		.addIntegerOption(o => o.setName('sentences').setDescription('Number of sentences (1-10)').setRequired(false)),
	async execute(interaction) {
		const count = Math.min(Math.max(interaction.options.getInteger('sentences') || 2, 1), 10);
		const text = Array.from({ length: count }, () => LOREM).join(' ');
		await interaction.reply({ content: text.slice(0, 1900), ephemeral: true });
	},
};

