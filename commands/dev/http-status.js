import { SlashCommandBuilder } from 'discord.js';

const CODES = {
  200: 'OK — The request succeeded.',
  201: 'Created — The request succeeded and a resource was created.',
  301: 'Moved Permanently — Resource has a new URI.',
  302: 'Found — Temporary redirect.',
  304: 'Not Modified — Use cached version.',
  400: 'Bad Request — The server cannot process the request due to client error.',
  401: 'Unauthorized — Missing or invalid auth.',
  403: 'Forbidden — You do not have access.',
  404: 'Not Found — The resource could not be found.',
  418: "I'm a teapot — RFC 2324 joke status.",
  429: 'Too Many Requests — You are rate-limited.',
  500: 'Internal Server Error — Generic server error.',
  502: 'Bad Gateway — Invalid response from upstream server.',
  503: 'Service Unavailable — Server is overloaded or down for maintenance.',
};

export default {
  data: new SlashCommandBuilder()
    .setName('http-status')
    .setDescription('Explain an HTTP status code')
    .addIntegerOption(o => o.setName('code').setDescription('HTTP code (e.g., 418, 404)').setRequired(true)),
  async execute(interaction) {
    const code = interaction.options.getInteger('code');
    const desc = CODES[code] || 'Unknown/less common HTTP status code.';
    await interaction.reply({ content: `HTTP ${code}: ${desc}`, ephemeral: true });
  },
};

