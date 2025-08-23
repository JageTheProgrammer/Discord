require('dotenv').config();

module.exports = {
	apps: [
		{
			name: 'discord-bot',
			script: 'index.js',
			node_args: '--experimental-json-modules',
			env: {
				NODE_ENV: 'production',
			},
			restart_delay: 2000,
			max_restarts: 10,
		},
	],
};

