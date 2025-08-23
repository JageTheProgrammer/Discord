import { SlashCommandBuilder } from 'discord.js';
import crypto from 'node:crypto';
import { parseDuration } from '../../utils/time.js';
import { addReminder } from '../../utils/reminders.js';

export default {
	data: new SlashCommandBuilder()
		.setName('remindme')
		.setDescription('Set a personal reminder')
		.addStringOption(o => o.setName('in').setDescription('When (e.g., 10m, 2h)').setRequired(true))
		.addStringOption(o => o.setName('text').setDescription('Reminder text').setRequired(true)),
	async execute(interaction) {
		const deltaStr = interaction.options.getString('in');
		const text = interaction.options.getString('text');
		const ms = parseDuration(deltaStr);
		if (!ms) return interaction.reply({ content: 'Invalid duration. Try 10m, 2h, 1d, etc.', ephemeral: true });
		const when = Date.now() + ms;
		const id = crypto.randomUUID();
		addReminder({ id, userId: interaction.user.id, channelId: interaction.channelId, when, text });
		await interaction.reply({ content: `Reminder set for <t:${Math.floor(when/1000)}:R>.`, ephemeral: true });
	},
};

