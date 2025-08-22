// events/clientReady.js
export default {
	name: 'clientReady',
	once: true,
	async execute(client) {
		console.log(`Logged in as ${client.user.tag}!`);
		const activity = process.env.BOT_ACTIVITY;
		if (activity) {
			try {
				client.user.setActivity(activity);
			} catch (err) {
				console.error('Failed to set activity:', err);
			}
		}
	},
};
