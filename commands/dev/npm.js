import { SlashCommandBuilder } from 'discord.js';
import axios from 'axios';
import { createEmbed, UI_COLORS } from '../../utils/ui.js';

export default {
	data: new SlashCommandBuilder()
		.setName('npm')
		.setDescription('Get NPM package info')
		.addStringOption(o => o.setName('name').setDescription('Package name').setRequired(true)),
	async execute(interaction) {
		const name = interaction.options.getString('name');
		await interaction.deferReply({ ephemeral: true });
		try {
			const { data } = await axios.get(`https://registry.npmjs.org/${encodeURIComponent(name)}`);
			const latest = data['dist-tags']?.latest;
			const verInfo = latest ? data.versions[latest] : null;
			const desc = verInfo?.description || data.description || 'No description';
			const homepage = verInfo?.homepage || data.homepage;
			const repo = verInfo?.repository?.url || data.repository?.url;
			const embed = createEmbed({
				title: `📦 npm: ${data.name || name}`,
				description: desc,
				color: UI_COLORS.info,
				fields: [
					{ name: 'Latest', value: latest || 'N/A', inline: true },
					{ name: 'License', value: verInfo?.license ? String(verInfo.license) : 'N/A', inline: true },
					{ name: 'Links', value: `[npmjs](https://www.npmjs.com/package/${encodeURIComponent(name)})${homepage ? ` • [home](${homepage})` : ''}${repo ? ` • [repo](${repo.replace('git+', '')})` : ''}` },
				],
			});
			await interaction.editReply({ embeds: [embed] });
		} catch (err) {
			await interaction.editReply({ content: `Package not found: ${name}` });
		}
	},
};

