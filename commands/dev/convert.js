import { SlashCommandBuilder } from 'discord.js';

function convert(value, from, to) {
	const units = {
		// bytes
		b: 1,
		kb: 1024,
		mb: 1024 ** 2,
		gb: 1024 ** 3,
		// time
		s: 1,
		min: 60,
		hr: 3600,
	};
	const f = units[from.toLowerCase()];
	const t = units[to.toLowerCase()];
	if (!f || !t) throw new Error('Unsupported units');
	return (value * f) / t;
}

export default {
	data: new SlashCommandBuilder()
		.setName('convert')
		.setDescription('Unit converter')
		.addNumberOption(o => o.setName('value').setDescription('Numeric value').setRequired(true))
		.addStringOption(o => o.setName('from').setDescription('From unit (b,kb,mb,gb,s,min,hr)').setRequired(true))
		.addStringOption(o => o.setName('to').setDescription('To unit (b,kb,mb,gb,s,min,hr)').setRequired(true)),
	async execute(interaction) {
		const value = interaction.options.getNumber('value');
		const from = interaction.options.getString('from');
		const to = interaction.options.getString('to');
		await interaction.deferReply({ ephemeral: true });
		try {
			const result = convert(value, from, to);
			await interaction.editReply({ content: `${value} ${from} = ${result} ${to}` });
		} catch {
			await interaction.editReply({ content: 'Unsupported units. Use: b,kb,mb,gb,s,min,hr' });
		}
	},
};

