import { getReminders, removeReminder } from '../utils/reminders.js';

export default {
	name: 'ready',
	once: true,
	async execute(client) {
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

