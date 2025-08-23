import { getReminders, removeReminder } from '../utils/reminders.js';
import { startStatusUpdater } from '../utils/statusUpdater.js';

export default {
	name: 'ready',
	once: true,
	async execute(client) {
		// Log bot identity and set optional activity
		console.log(`✅ Ready! Logged in as ${client.user.tag}`);
		const activity = process.env.BOT_ACTIVITY;
		if (activity) {
			try {
				client.user.setActivity(activity);
			} catch (err) {
				console.error('Failed to set activity:', err);
			}
		}

		// Start periodic status updater tasks
		startStatusUpdater(client);

		const tick = async () => {
			const now = Date.now();
			const due = getReminders().filter(r => r.when <= now).slice(0, 10);
			for (const r of due) {
				try {
					const channel = await client.channels.fetch(r.channelId).catch(() => null);
					if (channel) await channel.send({ content: `⏰ <@${r.userId}> Reminder: ${r.text}` });
				} finally {
					removeReminder(r.id);
				}
			}
			setTimeout(tick, 15_000);
		};
		tick();
	},
};

