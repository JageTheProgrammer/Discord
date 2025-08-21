// events/guildMemberAdd.js
export default {
	name: 'guildMemberAdd',
	async execute(member) {
		console.log(`New member joined: ${member.user.tag}`);
		try {
			await member.guild.systemChannel?.send(`Welcome, ${member.user.tag}, to the server!`);
		} catch (error) {
			console.error("Couldn't send welcome message:", error);
		}
	},
};