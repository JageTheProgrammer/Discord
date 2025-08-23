import { SlashCommandBuilder } from 'discord.js';
import { createEmbed } from '../../utils/ui.js';

function hexToRgb(hex) {
	const res = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return res ? { r: parseInt(res[1], 16), g: parseInt(res[2], 16), b: parseInt(res[3], 16) } : null;
}

export default {
	data: new SlashCommandBuilder()
		.setName('color')
		.setDescription('Preview color and conversions')
		.addStringOption(o => o.setName('value').setDescription('#hex or rgb(r,g,b)').setRequired(true)),
	async execute(interaction) {
		const value = interaction.options.getString('value');
		await interaction.deferReply({ ephemeral: true });
		let hex;
		let rgb;
		if (value.startsWith('#')) {
			hex = value;
			rgb = hexToRgb(hex);
		} else {
			const m = /rgb\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)/i.exec(value);
			if (m) {
				rgb = { r: +m[1], g: +m[2], b: +m[3] };
				hex = `#${[rgb.r, rgb.g, rgb.b].map(n => n.toString(16).padStart(2, '0')).join('')}`;
			}
		}
		if (!hex || !rgb) return interaction.editReply({ content: 'Provide #hex or rgb(r,g,b)' });
		const embed = createEmbed({
			title: `🎨 ${hex.toUpperCase()}`,
			description: `RGB(${rgb.r}, ${rgb.g}, ${rgb.b})` ,
			color: parseInt(hex.replace('#',''), 16),
		});
		await interaction.editReply({ embeds: [embed] });
	},
};

