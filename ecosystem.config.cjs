module.exports = {
	apps: [
		{
			name: 'discord-bot',
			script: 'index.js',
			env: {
				NODE_ENV: 'production',
			},
			restart_delay: 2000,
			max_restarts: 10,
		},
	],
};

