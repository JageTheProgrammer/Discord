import { SlashCommandBuilder } from 'discord.js';
import crypto from 'node:crypto';

function uuidv4() {
	return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
		(c ^ crypto.randomBytes(1)[0] & 15 >> c / 4).toString(16)
	);
}

function uuidv5(name, namespace) {
	// Simple v5 using SHA1 per RFC 4122
	const ns = Buffer.from(namespace.replace(/-/g, ''), 'hex');
	const hash = crypto.createHash('sha1').update(Buffer.concat([ns, Buffer.from(name)])).digest();
	hash[6] = (hash[6] & 0x0f) | 0x50; // version 5
	hash[8] = (hash[8] & 0x3f) | 0x80; // variant
	const b = hash.subarray(0, 16);
	const s = b.toString('hex');
	return `${s.slice(0,8)}-${s.slice(8,12)}-${s.slice(12,16)}-${s.slice(16,20)}-${s.slice(20,32)}`;
}

export default {
	data: new SlashCommandBuilder()
		.setName('uuid')
		.setDescription('Generate UUIDs')
		.addStringOption(o => o.setName('version').setDescription('v4 or v5').addChoices(
			{ name: 'v4', value: 'v4' },
			{ name: 'v5', value: 'v5' },
		).setRequired(true))
		.addStringOption(o => o.setName('name').setDescription('Name (for v5)').setRequired(false))
		.addStringOption(o => o.setName('namespace').setDescription('Namespace UUID (for v5)').setRequired(false)),
	async execute(interaction) {
		const version = interaction.options.getString('version');
		await interaction.deferReply({ ephemeral: true });
		if (version === 'v4') {
			return interaction.editReply({ content: uuidv4() });
		}
		const name = interaction.options.getString('name');
		const namespace = interaction.options.getString('namespace');
		if (!name || !namespace) {
			return interaction.editReply({ content: 'For v5, provide name and namespace UUID.' });
		}
		try {
			return interaction.editReply({ content: uuidv5(name, namespace) });
		} catch {
			return interaction.editReply({ content: 'Invalid namespace UUID.' });
		}
	},
};

