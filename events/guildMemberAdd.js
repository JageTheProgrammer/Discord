// events/guildMemberAdd.js
import { handleWelcome } from '../utils/statusUpdater.js';

export default {
	name: 'guildMemberAdd',
	async execute(member) {
		console.log(`New member joined: ${member.user.tag}`);
		try {
			await handleWelcome(member);
		} catch (error) {
			console.error("Couldn't send welcome message:", error);
		}
	},
};