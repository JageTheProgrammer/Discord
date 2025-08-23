import { SlashCommandBuilder } from 'discord.js';
import { createEmbed } from '../../utils/ui.js';

const cheats = [
	'git clone <url> — Clone repository',
	'git checkout -b <branch> — New branch',
	'git add -A && git commit -m "msg" — Commit changes',
	'git pull --rebase — Update branch',
	'git push -u origin <branch> — Push branch',
	'git stash && git stash pop — Save/restore WIP',
	'git log --oneline --graph — Pretty log',
];

export default {
	data: new SlashCommandBuilder()
		.setName('git-cheatsheet')
		.setDescription('Useful git commands'),
	async execute(interaction) {
		const embed = createEmbed({ title: '🐙 Git Cheatsheet', description: cheats.map(c => `• ${c}`).join('\n') });
		await interaction.reply({ embeds: [embed], ephemeral: true });
	},
};

