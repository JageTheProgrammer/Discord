import { SlashCommandBuilder } from 'discord.js';
import axios from 'axios';
import { createEmbed, UI_COLORS } from '../../utils/ui.js';

export default {
	data: new SlashCommandBuilder()
		.setName('pypi')
		.setDescription('Get PyPI package info')
		.addStringOption(o => o.setName('name').setDescription('Package name').setRequired(true)),
	async execute(interaction) {
		const name = interaction.options.getString('name');
		await interaction.deferReply({ ephemeral: true });
		try {
			const { data } = await axios.get(`https://pypi.org/pypi/${encodeURIComponent(name)}/json`);
			const info = data.info || {};
			const embed = createEmbed({
				title: `🐍 PyPI: ${info.name || name}`,
				description: info.summary || 'No description',
				color: UI_COLORS.info,
				fields: [
					{ name: 'Version', value: info.version || 'N/A', inline: true },
					{ name: 'License', value: info.license || 'N/A', inline: true },
					{ name: 'Links', value: `[PyPI](https://pypi.org/project/${encodeURIComponent(name)})${info.home_page ? ` • [home](${info.home_page})` : ''}${info.project_url ? ` • [project](${info.project_url})` : ''}` },
				],
			});
			await interaction.editReply({ embeds: [embed] });
		} catch (err) {
			await interaction.editReply({ content: `Package not found: ${name}` });
		}
	},
};

